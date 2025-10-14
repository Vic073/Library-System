import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Book, Borrow } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { BorrowList } from '../components/BorrowList';

export const StudentDashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [myBorrows, setMyBorrows] = useState<Borrow[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'mybooks'>('browse');
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadBooks(), loadMyBorrows()]);
    setLoading(false);
  };

  const loadBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('title', { ascending: true });
    if (data) setBooks(data);
  };

  const loadMyBorrows = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('borrows')
      .select('*, books(title, author, isbn)')
      .eq('user_id', user.id)
      .order('borrowed_at', { ascending: false });
    if (data) setMyBorrows(data);
  };

  const handleBorrowBook = async (bookId: string) => {
    if (!user) return;

    setBorrowing(bookId);
    try {
      const { error: borrowError } = await supabase
        .from('borrows')
        .insert([{ user_id: user.id, book_id: bookId }]);

      if (borrowError) throw borrowError;

      const { error: updateError } = await supabase
        .from('books')
        .update({ available: false })
        .eq('id', bookId);

      if (updateError) throw updateError;

      await loadData();
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert('Failed to borrow book');
    } finally {
      setBorrowing(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p className="welcome-text">Welcome, {user?.name}</p>
        </div>
        <button onClick={signOut} className="btn-secondary">
          Sign Out
        </button>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Books
        </button>
        <button
          className={`tab ${activeTab === 'mybooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('mybooks')}
        >
          My Borrowed Books
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="tab-content">
          <h2>Available Books</h2>
          <div className="books-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <h3>{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <p className="book-isbn">ISBN: {book.isbn}</p>
                <div className="book-status">
                  <span className={book.available ? 'available' : 'unavailable'}>
                    {book.available ? 'Available' : 'Borrowed'}
                  </span>
                </div>
                {book.available && (
                  <button
                    onClick={() => handleBorrowBook(book.id)}
                    className="btn-primary"
                    disabled={borrowing === book.id}
                  >
                    {borrowing === book.id ? 'Borrowing...' : 'Borrow'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {books.length === 0 && (
            <div className="empty-state">
              <p>No books available yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'mybooks' && (
        <div className="tab-content">
          <h2>My Borrowed Books</h2>
          <BorrowList borrows={myBorrows} onUpdate={loadMyBorrows} isAdmin={false} />

          {myBorrows.length === 0 && (
            <div className="empty-state">
              <p>You haven't borrowed any books yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

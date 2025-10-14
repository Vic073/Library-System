import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Book, Borrow } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { BookForm } from '../components/BookForm';
import { BorrowList } from '../components/BorrowList';

export const AdminDashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'books' | 'borrows'>('books');
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadBooks(), loadBorrows()]);
    setLoading(false);
  };

  const loadBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBooks(data);
  };

  const loadBorrows = async () => {
    const { data } = await supabase
      .from('borrows')
      .select('*, users(name, email), books(title, author)')
      .order('borrowed_at', { ascending: false });
    if (data) setBorrows(data);
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    const { error } = await supabase.from('books').delete().eq('id', id);
    if (!error) {
      await loadBooks();
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  const handleCloseForm = () => {
    setShowBookForm(false);
    setEditingBook(null);
  };

  const handleBookSaved = async () => {
    await loadBooks();
    handleCloseForm();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={signOut} className="btn-secondary">
          Sign Out
        </button>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          Books
        </button>
        <button
          className={`tab ${activeTab === 'borrows' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrows')}
        >
          Borrowed Books
        </button>
      </div>

      {activeTab === 'books' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Books</h2>
            <button
              onClick={() => setShowBookForm(true)}
              className="btn-primary"
            >
              Add New Book
            </button>
          </div>

          {showBookForm && (
            <BookForm
              book={editingBook}
              onSave={handleBookSaved}
              onCancel={handleCloseForm}
            />
          )}

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
                <div className="book-actions">
                  <button
                    onClick={() => handleEditBook(book)}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {books.length === 0 && (
            <div className="empty-state">
              <p>No books added yet. Click "Add New Book" to get started.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'borrows' && (
        <div className="tab-content">
          <h2>Borrowed Books</h2>
          <BorrowList borrows={borrows} onUpdate={loadBorrows} isAdmin />
        </div>
      )}
    </div>
  );
};

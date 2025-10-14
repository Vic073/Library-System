import { supabase } from '../lib/supabase';
import type { Borrow } from '../types';

interface BorrowListProps {
  borrows: Borrow[];
  onUpdate: () => void;
  isAdmin: boolean;
}

export const BorrowList = ({ borrows, onUpdate, isAdmin }: BorrowListProps) => {
  const handleReturn = async (borrow: Borrow) => {
    if (!confirm('Mark this book as returned?')) return;

    try {
      const { error: borrowError } = await supabase
        .from('borrows')
        .update({ returned: true, returned_at: new Date().toISOString() })
        .eq('id', borrow.id);

      if (borrowError) throw borrowError;

      const { error: bookError } = await supabase
        .from('books')
        .update({ available: true })
        .eq('id', borrow.book_id);

      if (bookError) throw bookError;

      onUpdate();
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Failed to return book');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (borrows.length === 0) {
    return null;
  }

  return (
    <div className="borrow-list">
      <table>
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Author</th>
            {isAdmin && <th>Borrowed By</th>}
            <th>Borrowed Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {borrows.map((borrow) => (
            <tr key={borrow.id}>
              <td>{borrow.books?.title}</td>
              <td>{borrow.books?.author}</td>
              {isAdmin && <td>{borrow.users?.name}</td>}
              <td>{formatDate(borrow.borrowed_at)}</td>
              <td>
                <span className={borrow.returned ? 'status-returned' : 'status-borrowed'}>
                  {borrow.returned ? 'Returned' : 'Borrowed'}
                </span>
              </td>
              <td>
                {!borrow.returned && (
                  <button
                    onClick={() => handleReturn(borrow)}
                    className="btn-primary btn-sm"
                  >
                    Return
                  </button>
                )}
                {borrow.returned && borrow.returned_at && (
                  <span className="returned-date">
                    {formatDate(borrow.returned_at)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

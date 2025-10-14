export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  created_at: string;
}

export interface Borrow {
  id: string;
  user_id: string;
  book_id: string;
  borrowed_at: string;
  returned: boolean;
  returned_at: string | null;
  users?: User;
  books?: Book;
}

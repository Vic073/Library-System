/*
  # Library Management System Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password` (text)
      - `role` (text, default 'student')
      - `created_at` (timestamptz)
    
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `isbn` (text, unique)
      - `available` (boolean, default true)
      - `created_at` (timestamptz)
    
    - `borrows`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `book_id` (uuid, foreign key)
      - `borrowed_at` (timestamptz)
      - `returned` (boolean, default false)
      - `returned_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Students can view books and their own borrows
    - Admins can manage books and view all borrows
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create borrows table
CREATE TABLE IF NOT EXISTS borrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrowed_at timestamptz DEFAULT now(),
  returned boolean DEFAULT false,
  returned_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_borrows_user_id ON borrows(user_id);
CREATE INDEX IF NOT EXISTS idx_borrows_book_id ON borrows(book_id);
CREATE INDEX IF NOT EXISTS idx_books_available ON books(available);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrows ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  TO authenticated
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Books table policies (all authenticated users can view books)
CREATE POLICY "Anyone can view books"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

-- Borrows table policies
CREATE POLICY "Users can view their own borrows"
  ON borrows FOR SELECT
  TO authenticated
  USING (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can create borrows"
  ON borrows FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own borrows"
  ON borrows FOR UPDATE
  TO authenticated
  USING (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  )
  WITH CHECK (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );
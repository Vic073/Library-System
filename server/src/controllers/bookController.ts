import { Request, Response } from 'express';
import prisma from '../config/prisma';

// ✅ Get all books
export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch books', error });
  }
};

// ✅ Add a new book
export const addBook = async (req: Request, res: Response) => {
  try {
    const { title, author, isbn } = req.body;
    const newBook = await prisma.book.create({
      data: { title, author, isbn },
    });
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add book', error });
  }
};

// ✅ Update book
export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, available } = req.body;
    const updatedBook = await prisma.book.update({
      where: { id: Number(id) },
      data: { title, author, isbn, available },
    });
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book', error });
  }
};

// ✅ Delete book
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.book.delete({ where: { id: Number(id) } });
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book', error });
  }
};

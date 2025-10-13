import { Request, Response } from 'express';
import prisma from '../config/prisma';

// ✅ Borrow a book
export const borrowBook = async (req: Request, res: Response) => {
  try {
    const { userId, bookId } = req.body;

    // Check book availability
    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (!book || !book.available)
      return res.status(400).json({ message: 'Book not available' });

    // Create borrow record
    const borrow = await prisma.borrow.create({
      data: { userId: Number(userId), bookId: Number(bookId) },
    });

    // Mark book as unavailable
    await prisma.book.update({
      where: { id: Number(bookId) },
      data: { available: false },
    });

    res.status(201).json(borrow);
  } catch (error) {
    res.status(500).json({ message: 'Failed to borrow book', error });
  }
};

// ✅ Return book
export const returnBook = async (req: Request, res: Response) => {
  try {
    const { borrowId } = req.params;

    const borrow = await prisma.borrow.update({
      where: { id: Number(borrowId) },
      data: { returned: true },
    });

    // Mark book as available again
    await prisma.book.update({
      where: { id: borrow.bookId },
      data: { available: true },
    });

    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to return book', error });
  }
};

// ✅ View all borrowed books
export const getBorrows = async (req: Request, res: Response) => {
  try {
    const borrows = await prisma.borrow.findMany({
      include: { user: true, book: true },
    });
    res.json(borrows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch borrowed books', error });
  }
};

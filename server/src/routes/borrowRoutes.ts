import express from 'express';
import { borrowBook, returnBook, getBorrows } from '../controllers/borrowController';

const router = express.Router();

router.post('/', borrowBook);
router.put('/:borrowId/return', returnBook);
router.get('/', getBorrows);

export default router;

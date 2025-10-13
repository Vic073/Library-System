import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bookRoutes from './routes/bookRoutes';
import userRoutes from './routes/userRoutes';
import borrowRoutes from './routes/borrowRoutes';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('📚 Library Management System API is running...');
});

app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrows', borrowRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

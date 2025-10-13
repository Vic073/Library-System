import express from 'express';
import { getUsers, registerUser, deleteUser } from '../controllers/userController';

const router = express.Router();

router.get('/', getUsers);
router.post('/', registerUser);
router.delete('/:id', deleteUser);

export default router;

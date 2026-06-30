import express from 'express';
import { 
    createUser, 
    loginUser,
    logoutUser,
    getCurrentUser,
    getUser, 
    getUserById, 
    updateUser, 
    deleteUser 
} from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();


router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/logout', verifyToken, logoutUser);
router.get('/me', verifyToken, getCurrentUser);


router.post('/', verifyToken, requireRole('admin'), createUser);
router.get('/', verifyToken, requireRole('admin'), getUser);
router.get('/:id', verifyToken, requireRole('admin'), getUserById);
router.put('/:id', verifyToken, requireRole('admin'), updateUser);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

export default router;

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
import uploadKtm from '../middleware/uploadKtm.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();


router.post('/register', uploadKtm.single('ktm'),createUser);
router.post('/login', loginUser);
router.post('/logout', verifyToken, logoutUser);
router.get('/me', verifyToken, getCurrentUser);

router.post('/', verifyToken, requireRole('admin'),  uploadKtm.single('ktm'),createUser);
router.get('/', verifyToken, requireRole('admin'), getUser);
router.get('/:id', verifyToken, requireRole('admin'), getUserById);
router.put('/:id', verifyToken, requireRole('admin'), uploadKtm.single('ktm'),updateUser);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

export default router;

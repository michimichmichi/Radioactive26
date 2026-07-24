import express from 'express';
import { 
    createUser, 
    loginUser,
    logoutUser,
    getCurrentUser,
    getUser, 
    getParticipants,
    getUserById, 
    updateUser, 
    deleteUser 
} from '../controllers/userController.js';
import uploadKtm, { validateKtmUpload } from '../middleware/uploadKtm.js';
import { verifyToken, optionalVerifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();


router.post('/register', uploadKtm.single('ktm'), validateKtmUpload, createUser);
router.post('/login', loginUser);
router.post('/logout', optionalVerifyToken, logoutUser);
router.get('/me', verifyToken, getCurrentUser);

router.post('/', verifyToken, requireRole('admin'),  uploadKtm.single('ktm'), validateKtmUpload, createUser);
router.get('/', verifyToken, requireRole('admin'), getUser);
router.get('/participants', verifyToken, getParticipants);
router.get('/:id', verifyToken, requireRole('admin'), getUserById);
router.put('/:id', verifyToken, requireRole('admin'), uploadKtm.single('ktm'), validateKtmUpload, updateUser);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

export default router;

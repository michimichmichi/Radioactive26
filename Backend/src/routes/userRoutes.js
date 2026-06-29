import express from 'express';
import { 
    createUser, 
    loginUser, 
    getUser, 
    getUserById, 
    updateUser, 
    deleteUser 
} from '../controllers/userController.js';

const router = express.Router();


router.post('/register', createUser);
router.post('/login', loginUser);


router.get('/', getUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
import express from 'express';
import { 
    createCompetition, 
    getCompetition, 
    updateCompetition, 
    deleteCompetition 
} from '../controllers/competitionController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post("/", verifyToken, requireRole('admin'), createCompetition);
router.get("/", getCompetition);
router.put("/:id", verifyToken, requireRole('admin'), updateCompetition);
router.delete("/:id", verifyToken, requireRole('admin'), deleteCompetition);

export default router;

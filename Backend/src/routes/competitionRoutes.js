import express from 'express';
import { 
    createCompetition, 
    getCompetition, 
    updateCompetition, 
    deleteCompetition 
} from '../controllers/competitionController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post("/", verifyToken, requireRole('admin', 'event'), createCompetition);
router.get("/", getCompetition);
router.put("/:id", verifyToken, requireRole('admin', 'event'), updateCompetition);
router.delete("/:id", verifyToken, requireRole('admin', 'event'), deleteCompetition);

export default router;

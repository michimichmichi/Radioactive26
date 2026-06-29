import express from 'express';
import { 
    createCompetition, 
    getCompetition, 
    updateCompetition, 
    deleteCompetition 
} from '../controllers/competitionController.js';

const router = express.Router();

router.post("/", createCompetition);
router.get("/", getCompetition);
router.put("/:id", updateCompetition);
router.delete("/:id", deleteCompetition);

export default router;
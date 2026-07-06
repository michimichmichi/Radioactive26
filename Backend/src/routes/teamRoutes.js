import express from "express";
import {
    createTeam,
    getAllTeams,
    updateTeam,
    searchTeams,
    deleteTeam
} from "../controllers/teamController.js";
import uploadTransfer from "../middleware/uploadTransfer.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, requireRole('admin'), uploadTransfer.single("buktiTransfer"), createTeam);
router.get("/", getAllTeams);
router.get("/search", searchTeams);
router.delete("/:id", verifyToken, requireRole('admin'), deleteTeam);
router.put("/:id", verifyToken, requireRole('admin'), uploadTransfer.single("buktiTransfer"), updateTeam);

export default router;

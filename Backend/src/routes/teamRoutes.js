import express from "express";
import {
    createTeam,
    getAllTeams,
    updateTeam,
    searchTeams,
    deleteTeam
} from "../controllers/teamController.js";
import uploadTransfer, { validateTransferUpload } from "../middleware/uploadTransfer.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, requireRole('admin', 'user'), uploadTransfer.single("buktiTransfer"), validateTransferUpload, createTeam);
router.get("/", getAllTeams);
router.get("/search", searchTeams);
router.delete("/:id", verifyToken, requireRole('admin'), deleteTeam);
router.put("/:id", verifyToken, requireRole('admin', 'user'), uploadTransfer.single("buktiTransfer"), validateTransferUpload, updateTeam);

export default router;

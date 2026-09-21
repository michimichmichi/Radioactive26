import express from "express";
import {
    getAllTeams,
    updateTeam,
    searchTeams,
    deleteTeam
} from "../controllers/teamController.js";
import uploadTransfer, { validateTransferUpload } from "../middleware/uploadTransfer.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Reject new registrations before authentication or payment-proof uploads.
router.post("/", (_req, res) => res.status(403).json({
    message: "Competition registration is closed. Existing registrations can still be viewed.",
}));
router.get("/", verifyToken, getAllTeams);
router.get("/search", verifyToken, requireRole('admin'), searchTeams);
router.delete("/:id", verifyToken, requireRole('admin'), deleteTeam);
router.put("/:id", verifyToken, requireRole('admin'), uploadTransfer.single("buktiTransfer"), validateTransferUpload, updateTeam);

export default router;

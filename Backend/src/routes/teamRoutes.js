import express from "express";
import {
    createTeam,
    getAllTeams,
    updateTeam,
    searchTeams,
    deleteTeam
} from "../controllers/teamController.js";

const router = express.Router();


router.post("/", createTeam);
router.get("/", getAllTeams);
router.get("/search", searchTeams);
router.delete("/:id", deleteTeam);
router.put("/:id", updateTeam);



export default router;
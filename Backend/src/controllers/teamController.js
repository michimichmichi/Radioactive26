import Team from "../models/Team.js";
import fs from "fs/promises";
import path from "path";

const deleteTransferFile = async (transferPath) => {
    if (!transferPath) return;

    const filePath = path.join(
        process.cwd(),
        "src",
        transferPath.replace(/^\//, "")
    );

    try {
        await fs.unlink(filePath);

    } catch (err) {
        console.warn("Failed to delete Transfer:", err.message);

    }
};

const deleteUploadedTransfer = async (filename) => {
    if (!filename) return;

    const filePath = path.join(
        process.cwd(),
        "src",
        "uploads",
        "transfer",
        filename
    );

    try {
        await fs.unlink(filePath);
    } catch (err) {
        console.warn("Failed to delete uploaded Transfer:", err.message);
    }
};

//Create Team (Admin & User) 
export const createTeam = async (req, res) => {
    try {
        const {
            teamName,
            leaderId,
            members,
            competitionId
        } = req.body;

        const buktiTransfer = req.file
            ? `/uploads/transfer/${req.file.filename}`
            : null;

        const team = await Team.create({
            teamName,
            leaderId,
            members,
            competitionId,
            buktiTransfer
        });

        return res.status(201).json({
            message: "Team created",
            team
        });

    } catch (error) {
        if (req.file) {
            await deleteUploadedTransfer(req.file.filename);
        }

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Team name already exists"
            });
        }

        return res.status(500).json({
            message: error.message
        });
        
    }
};

//Tampilin Nama Teams(Admin)
export const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate("leaderId", "name email")
            .populate("members", "name email")
            .populate("competitionId", "competitionName time place");

        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Update Team (Admin)
export const updateTeam = async (req, res) => {
    try {
        const existingTeam = await Team.findById(req.params.id);

        if (!existingTeam) {
            if (req.file) {
                await deleteUploadedTransfer(req.file.filename);
            }

            return res.status(404).json({
                message: "Team not found"
            });
        }

        const oldTransfer = existingTeam.buktiTransfer;
        const updateData = { ...req.body };

        if (req.file) {
            updateData.buktiTransfer =
                `/uploads/transfer/${req.file.filename}`;
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTeam) {
            if (req.file) {
                await deleteUploadedTransfer(req.file.filename);
            }

            return res.status(404).json({
                message: "Team not found"
            });
        }

        if (req.file && oldTransfer) {
            await deleteTransferFile(oldTransfer);
        }

        return res.status(200).json({
            message: "Team updated successfully",
            updatedTeam
        });

    } catch (error) {
        if (req.file) {
            await deleteUploadedTransfer(req.file.filename);
        }

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Team name already exists"
            });
        }

        return res.status(500).json({
            message: error.message
        });
    }
};

//Delete Team (Admin)
export const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                message: "Team not found"
            });
        }

        const deletedTeam = await Team.findByIdAndDelete(req.params.id);
        if (!deletedTeam) {
            return res.status(404).json({
                message: "Team not found"
            });
        }

        await deleteTransferFile(deletedTeam.buktiTransfer);

        return res.status(200).json({
            message: "Team deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Search Team Name (Admin)
export const searchTeams = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const teams = await Team.find({
            teamName: { $regex: query, $options: "i" } 
        });

        res.status(200).json({
            count: teams.length,
            teams
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

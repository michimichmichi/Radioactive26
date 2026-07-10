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

const normalizeMembers = (members) => {
    if (members === undefined) return [];
    const memberList = Array.isArray(members) ? members : [members];
    return [...new Set(memberList.filter(Boolean).map((member) => member.toString()))];
};

const getParticipantIds = (leaderId, members) => {
    return [...new Set([leaderId?.toString(), ...normalizeMembers(members)].filter(Boolean))];
};

const findCompetitionConflict = async ({
    competitionId,
    excludeTeamId = null,
    participantIds
}) => {
    if (!competitionId || participantIds.length === 0) return null;

    const query = {
        competitionId,
        $or: [
            { leaderId: { $in: participantIds } },
            { members: { $in: participantIds } }
        ]
    };

    if (excludeTeamId) {
        query._id = { $ne: excludeTeamId };
    }

    return Team.findOne(query)
        .populate("leaderId", "name nim")
        .populate("members", "name nim");
};

const getConflictMessage = (conflictTeam, participantIds) => {
    const conflictingLeader = conflictTeam.leaderId &&
        participantIds.includes(conflictTeam.leaderId._id.toString())
        ? conflictTeam.leaderId
        : null;

    const conflictingMember = conflictTeam.members.find((member) =>
        participantIds.includes(member._id.toString())
    );

    const user = conflictingLeader || conflictingMember;

    if (!user) {
        return "A selected participant is already registered in this competition";
    }

    return `${user.name} (${user.nim}) is already registered in this competition`;
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

        const teamLeaderId = req.user?.role === "admin" ? leaderId : req.user.id;
        const teamMembers = normalizeMembers(members).filter(
            (memberId) => memberId !== teamLeaderId?.toString()
        );
        const participantIds = getParticipantIds(teamLeaderId, teamMembers);
        const conflictTeam = await findCompetitionConflict({
            competitionId,
            participantIds
        });

        if (conflictTeam) {
            if (req.file) {
                await deleteUploadedTransfer(req.file.filename);
            }

            return res.status(400).json({
                message: getConflictMessage(conflictTeam, participantIds)
            });
        }

        const buktiTransfer = req.file
            ? `/uploads/transfer/${req.file.filename}`
            : null;

        const team = await Team.create({
            teamName,
            leaderId: teamLeaderId,
            members: teamMembers,
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
            .populate("leaderId", "name email university nim")
            .populate("members", "name email university nim")
            .populate("competitionId", "competitionName time place");

        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Update Team (Admin & Team Leader)
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
        const isAdmin = req.user?.role === "admin";
        const isLeader =
            existingTeam.leaderId.toString() === req.user?.id?.toString();

        if (!isAdmin && !isLeader) {
            if (req.file) {
                await deleteUploadedTransfer(req.file.filename);
            }

            return res.status(403).json({
                message: "Only the team leader can manage this team"
            });
        }

        const nextCompetitionId = req.body.competitionId || existingTeam.competitionId;
        const nextLeaderId = isAdmin && req.body.leaderId
            ? req.body.leaderId
            : existingTeam.leaderId;
        const requestedMembers = req.body.members === undefined
            ? existingTeam.members
            : req.body.members;
        const nextMembers = normalizeMembers(requestedMembers).filter(
            (memberId) => memberId !== nextLeaderId?.toString()
        );
        const participantIds = getParticipantIds(nextLeaderId, nextMembers);
        const conflictTeam = await findCompetitionConflict({
            competitionId: nextCompetitionId,
            excludeTeamId: existingTeam._id,
            participantIds
        });

        if (conflictTeam) {
            if (req.file) {
                await deleteUploadedTransfer(req.file.filename);
            }

            return res.status(400).json({
                message: getConflictMessage(conflictTeam, participantIds)
            });
        }

        const updateData = isAdmin
            ? {
                ...req.body,
                members: nextMembers
            }
            : {
                teamName: req.body.teamName,
                members: nextMembers
            };

        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

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

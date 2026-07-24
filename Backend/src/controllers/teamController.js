import Team from "../models/Team.js";
import User from "../models/User.js";
import Competition from "../models/Competition.js";
import fs from "fs/promises";
import path from "path";
import { escapeRegex, isValidObjectId, normalizeString } from "../utils/security.js";

const deleteTransferFile = async (transferPath) => {
    if (!transferPath || !/^\/uploads\/transfer\/[^/]+$/.test(transferPath)) return;

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
    if (!filename || !/^(?:\d{10,}-)?[a-f\d-]{16,}\.(?:jpg|jpeg|png)$/i.test(filename)) return;

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

        const normalizedTeamName = normalizeString(teamName, { max: 120, required: true });
        if (!normalizedTeamName || !isValidObjectId(competitionId)) {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            return res.status(400).json({ message: "Invalid team data" });
        }

        const teamLeaderId = req.user?.role === "admin" ? leaderId : req.user.id;
        if (!isValidObjectId(teamLeaderId)) {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            return res.status(400).json({ message: "Invalid team leader" });
        }
        const teamMembers = normalizeMembers(members).filter(
            (memberId) => memberId !== teamLeaderId?.toString()
        );
        if (teamMembers.length > 50) {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            return res.status(400).json({ message: "A team cannot have more than 50 members" });
        }
        const participantIds = getParticipantIds(teamLeaderId, teamMembers);
        const [competition, participantCount] = await Promise.all([
            Competition.exists({ _id: competitionId }),
            User.countDocuments({ _id: { $in: participantIds } })
        ]);

        if (!competition || participantCount !== participantIds.length) {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            return res.status(400).json({ message: "Invalid competition or participant" });
        }
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
            teamName: normalizedTeamName,
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
        const query = req.user.role === 'admin'
            ? {}
            : { $or: [{ leaderId: req.user.id }, { members: req.user.id }] };
        const userFields = req.user.role === 'admin' ? "name email university nim" : "name university nim";
        const teams = await Team.find(query)
            .limit(500)
            .populate("leaderId", userFields)
            .populate("members", userFields)
            .populate("competitionId", "competitionName time place");

        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Update Team (Admin only)
export const updateTeam = async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            return res.status(403).json({
                message: "Only admins can modify team registrations"
            });
        }

        if (!isValidObjectId(req.params.id)) {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            return res.status(400).json({ message: "Invalid team id" });
        }

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
        if (nextMembers.length > 50) {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            return res.status(400).json({ message: "A team cannot have more than 50 members" });
        }
        const nextTeamName = req.body.teamName === undefined
            ? existingTeam.teamName
            : normalizeString(req.body.teamName, { max: 120, required: true });

        if (!nextTeamName || !isValidObjectId(nextCompetitionId) || !isValidObjectId(nextLeaderId) || nextMembers.some((id) => !isValidObjectId(id))) {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            return res.status(400).json({ message: "Invalid team data" });
        }

        const participantIds = getParticipantIds(nextLeaderId, nextMembers);
        const [competition, participantCount] = await Promise.all([
            Competition.exists({ _id: nextCompetitionId }),
            User.countDocuments({ _id: { $in: participantIds } })
        ]);

        if (!competition || participantCount !== participantIds.length) {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            return res.status(400).json({ message: "Invalid competition or participant" });
        }
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
                teamName: nextTeamName,
                leaderId: nextLeaderId,
                competitionId: nextCompetitionId,
                members: nextMembers
            }
            : {
                teamName: nextTeamName,
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
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid team id" });
        }
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

        if (typeof query !== 'string' || !query.trim() || query.trim().length > 80) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const teams = await Team.find({
            teamName: { $regex: escapeRegex(query.trim()), $options: "i" }
        }).limit(100).select('teamName leaderId members competitionId buktiTransfer');

        res.status(200).json({
            count: teams.length,
            teams
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

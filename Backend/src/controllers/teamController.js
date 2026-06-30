import Team from "../models/Team.js";
//Create Team (Admin & User) 
export const createTeam = async (req, res) => {
    try {
        console.log("🔥 HIT CREATE TEAM ROUTE");
        console.log("BODY:", req.body);

        if (!req.body) {
            return res.status(400).json({
                message: "req.body is undefined"
            });
        }

        const {
            teamName,
            leaderId,
            members,
            competitionId,
            buktiTransfer
        } = req.body;

        console.log("STEP 2 PASSED");

        const team = await Team.create({
            teamName,
            leaderId,
            members,
            competitionId,
            buktiTransfer
        });

        console.log("💾 SAVED TEAM:", team);

        return res.status(201).json({
            message: "Team created",
            team
        });

    } catch (error) {
        console.log("❌ ERROR CAUGHT:", error);
        return res.status(500).json({ message: error.message });
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
        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ message: "Team not found" });
        }

        res.status(200).json({
            message: "Team updated successfully",
            updatedTeam
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Delete Team (Admin)
export const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        res.status(200).json({
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

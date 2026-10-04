import User from '../models/User.js';
import Team from '../models/Team.js';
import Competition from '../models/Competition.js';
import { sendError } from '../middleware/errorHandler.js';

export const getAdminStats = async (req, res) => {
    try {
        const [users, teams, competitions] = await Promise.all([
            User.countDocuments({}),
            Team.countDocuments({}),
            Competition.countDocuments({})
        ]);
        return res.status(200).json({ users, teams, competitions });
    } catch (error) {
        return sendError(error, req, res);
    }
};

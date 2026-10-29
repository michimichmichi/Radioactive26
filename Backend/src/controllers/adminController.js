import User from '../models/User.js';
import Team from '../models/Team.js';
import Competition from '../models/Competition.js';
import Encorian from '../models/Encorian.js';
import OtsTicket from '../models/OtsTicket.js';
import { sendError } from '../middleware/errorHandler.js';

export const getAdminStats = async (req, res) => {
    try {
        const [users, teams, competitions, encoreSold, otsTotals] = await Promise.all([
            User.countDocuments({}),
            Team.countDocuments({}),
            Competition.countDocuments({}),
            Encorian.countDocuments({ status: 'approved' }),
            OtsTicket.aggregate([
                {
                    $group: {
                        _id: null,
                        totalTickets: { $sum: '$quantity' },
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                }
            ])
        ]);

        const otsSold = otsTotals[0]?.totalTickets || 0;
        const otsRevenue = otsTotals[0]?.totalRevenue || 0;
        const encoreRevenue = encoreSold * 35000;
        const totalSoldTickets = encoreSold + otsSold;
        const totalRevenue = encoreRevenue + otsRevenue;

        const userRole = req.user?.role || '';
        const canViewMoney = ['admin', 'it_admin', 'finance'].includes(userRole);

        return res.status(200).json({
            users,
            teams,
            competitions,
            soldTickets: totalSoldTickets,
            encoreSold,
            otsSold,
            canViewMoney,
            totalRevenue: canViewMoney ? totalRevenue : undefined,
            encoreRevenue: canViewMoney ? encoreRevenue : undefined,
            otsRevenue: canViewMoney ? otsRevenue : undefined
        });
    } catch (error) {
        return sendError(error, req, res);
    }
};

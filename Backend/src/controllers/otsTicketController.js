import OtsTicket from '../models/OtsTicket.js';
import OtsSetting from '../models/OtsSetting.js';
import { sendError } from '../middleware/errorHandler.js';

const getSettingPrice = async () => {
    try {
        let setting = await OtsSetting.findOne({ key: 'default' });
        if (!setting) {
            setting = await OtsSetting.create({ key: 'default', defaultPrice: 35000 });
        }
        return setting.defaultPrice;
    } catch {
        return 35000;
    }
};

export const getOtsTickets = async (req, res) => {
    try {
        const sales = await OtsTicket.find().sort({ createdAt: -1 }).limit(300);

        const totals = await OtsTicket.aggregate([
            {
                $group: {
                    _id: null,
                    totalTickets: { $sum: '$quantity' },
                    totalRevenue: { $sum: '$totalAmount' },
                    totalCashRevenue: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$totalAmount', 0]
                        }
                    },
                    totalCashTickets: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$quantity', 0]
                        }
                    },
                    totalQrisRevenue: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'qris'] }, '$totalAmount', 0]
                        }
                    },
                    totalQrisTickets: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'qris'] }, '$quantity', 0]
                        }
                    }
                }
            }
        ]);

        const defaultPrice = await getSettingPrice();

        const userRole = req.user?.role || '';
        const canViewMoney = ['admin', 'it_admin', 'finance'].includes(userRole);

        const stats = totals[0] || {
            totalTickets: 0,
            totalRevenue: 0,
            totalCashRevenue: 0,
            totalCashTickets: 0,
            totalQrisRevenue: 0,
            totalQrisTickets: 0
        };

        if (!canViewMoney) {
            stats.totalRevenue = null;
            stats.totalCashRevenue = null;
            stats.totalQrisRevenue = null;
        }

        const safeSales = canViewMoney
            ? sales
            : sales.map((s) => {
                const doc = s.toObject ? s.toObject() : { ...s };
                doc.totalAmount = null;
                doc.pricePerTicket = null;
                return doc;
            });

        res.json({
            sales: safeSales,
            stats,
            defaultPrice: canViewMoney ? defaultPrice : 35000,
            canViewMoney
        });
    } catch (err) {
        sendError(res, err);
    }
};

export const recordOtsTicket = async (req, res) => {
    try {
        let { quantity, pricePerTicket, paymentMethod, notes } = req.body || {};

        quantity = Math.max(1, parseInt(quantity, 10) || 1);

        if (!pricePerTicket || Number(pricePerTicket) <= 0) {
            pricePerTicket = await getSettingPrice();
        } else {
            pricePerTicket = Number(pricePerTicket);
        }

        const validMethods = ['cash', 'qris', 'transfer', 'other'];
        const method = validMethods.includes(paymentMethod) ? paymentMethod : 'cash';

        const totalAmount = quantity * pricePerTicket;

        const ticket = await OtsTicket.create({
            quantity,
            pricePerTicket,
            totalAmount,
            paymentMethod: method,
            notes: (notes || '').trim(),
            recordedBy: req.user?.name || 'Admin'
        });

        res.status(201).json({
            message: 'OTS ticket sale recorded successfully',
            ticket
        });
    } catch (err) {
        sendError(res, err);
    }
};

export const deleteOtsTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await OtsTicket.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'OTS ticket record not found' });
        }
        res.json({ message: 'OTS ticket record deleted' });
    } catch (err) {
        sendError(res, err);
    }
};

export const updateOtsSettings = async (req, res) => {
    try {
        const { defaultPrice } = req.body;
        const price = Math.max(0, Number(defaultPrice) || 0);

        const setting = await OtsSetting.findOneAndUpdate(
            { key: 'default' },
            { defaultPrice: price },
            { new: true, upsert: true }
        );

        res.json({
            message: 'Default OTS ticket price updated',
            defaultPrice: setting.defaultPrice
        });
    } catch (err) {
        sendError(res, err);
    }
};

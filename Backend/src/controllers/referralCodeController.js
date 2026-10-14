import crypto from 'crypto';
import ReferralCode from '../models/ReferralCode.js';
import Encorian from '../models/Encorian.js';
import { sendError } from '../middleware/errorHandler.js';
import { isValidObjectId, normalizeString } from '../utils/security.js';

// Generate a random code: RAC-XXXXX (5 characters)
export const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    const bytes = crypto.randomBytes(5);
    for (let i = 0; i < 5; i++) {
        randomPart += chars[bytes[i] % chars.length];
    }
    return `RAC-${randomPart}`;
};

// GET /admin/referral-codes -- list all codes with live sales stats
export const getReferralCodes = async (req, res) => {
    try {
        const codes = await ReferralCode.find().sort({ createdAt: -1 });

        // Aggregate Encorian counts by referralCode and status
        const stats = await Encorian.aggregate([
            { $match: { referralCode: { $ne: null } } },
            {
                $group: {
                    _id: { code: '$referralCode', status: '$status' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const statsMap = {};
        for (const item of stats) {
            const code = item._id.code;
            const status = item._id.status;
            if (!statsMap[code]) {
                statsMap[code] = { approved: 0, pending: 0, rejected: 0 };
            }
            if (statsMap[code][status] !== undefined) {
                statsMap[code][status] = item.count;
            }
        }

        const result = codes.map((doc) => {
            const codeStats = statsMap[doc.code] || { approved: 0, pending: 0, rejected: 0 };
            const approvedCount = codeStats.approved;
            const pendingCount = codeStats.pending;
            const rejectedCount = codeStats.rejected;
            const totalSubmissions = approvedCount + pendingCount;
            const remainingToTarget = Math.max(0, doc.targetQuota - approvedCount);
            const progressPercentage = doc.targetQuota > 0
                ? Math.min(100, Math.round((approvedCount / doc.targetQuota) * 100))
                : 0;

            return {
                _id: doc._id,
                code: doc.code,
                panitiaName: doc.panitiaName,
                targetQuota: doc.targetQuota,
                isActive: doc.isActive,
                approvedCount,
                pendingCount,
                rejectedCount,
                totalSubmissions,
                remainingToTarget,
                progressPercentage,
                createdAt: doc.createdAt
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        return sendError(error, req, res);
    }
};

// POST /admin/referral-codes -- create referral code
export const createReferralCode = async (req, res) => {
    try {
        const panitiaName = normalizeString(req.body.panitiaName, { max: 120, required: true });
        let customCode = req.body.code ? req.body.code.trim().toUpperCase() : '';
        const targetQuota = Number(req.body.targetQuota) || 10;

        if (!panitiaName) {
            return res.status(400).json({ message: 'Panitia name is required.' });
        }

        if (targetQuota < 1) {
            return res.status(400).json({ message: 'Target quota must be at least 1.' });
        }

        let finalCode = customCode;
        if (!finalCode) {
            // Auto generate unique RAC-XXXXX
            let attempts = 0;
            do {
                finalCode = generateRandomCode();
                const exists = await ReferralCode.findOne({ code: finalCode });
                if (!exists) break;
                attempts++;
            } while (attempts < 10);
        } else {
            // If custom code doesn't start with RAC-, prefix it
            if (!finalCode.startsWith('RAC-')) {
                finalCode = `RAC-${finalCode.replace(/[^A-Z0-9_-]/g, '')}`;
            } else {
                finalCode = `RAC-${finalCode.slice(4).replace(/[^A-Z0-9_-]/g, '')}`;
            }

            const existing = await ReferralCode.findOne({ code: finalCode });
            if (existing) {
                return res.status(409).json({ message: `Referral code "${finalCode}" is already in use.` });
            }
        }

        const newDoc = await ReferralCode.create({
            code: finalCode,
            panitiaName,
            targetQuota,
            isActive: true
        });

        return res.status(201).json({
            message: 'Referral code created successfully.',
            referralCode: newDoc
        });
    } catch (error) {
        return sendError(error, req, res);
    }
};

// PATCH /admin/referral-codes/:id -- update quota or active status
export const updateReferralCode = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid referral code id' });
        }

        const refCode = await ReferralCode.findById(req.params.id);
        if (!refCode) {
            return res.status(404).json({ message: 'Referral code not found.' });
        }

        if (req.body.panitiaName !== undefined) {
            const name = normalizeString(req.body.panitiaName, { max: 120, required: true });
            if (name) refCode.panitiaName = name;
        }

        if (req.body.targetQuota !== undefined) {
            const quota = Number(req.body.targetQuota);
            if (quota >= 1) refCode.targetQuota = quota;
        }

        if (req.body.isActive !== undefined) {
            refCode.isActive = Boolean(req.body.isActive);
        }

        await refCode.save();

        return res.status(200).json({
            message: 'Referral code updated successfully.',
            referralCode: refCode
        });
    } catch (error) {
        return sendError(error, req, res);
    }
};

// DELETE /admin/referral-codes/:id -- delete referral code
export const deleteReferralCode = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid referral code id' });
        }

        const refCode = await ReferralCode.findByIdAndDelete(req.params.id);
        if (!refCode) {
            return res.status(404).json({ message: 'Referral code not found.' });
        }

        return res.status(200).json({ message: 'Referral code deleted successfully.' });
    } catch (error) {
        return sendError(error, req, res);
    }
};

// GET /encorians/verify-code/:code -- public check for buyer
export const verifyReferralCode = async (req, res) => {
    try {
        const rawCode = req.params.code ? req.params.code.trim().toUpperCase() : '';
        if (!rawCode) {
            return res.status(400).json({ valid: false, message: 'Referral code is required.' });
        }

        const ref = await ReferralCode.findOne({ code: rawCode, isActive: true });
        if (!ref) {
            return res.status(404).json({ valid: false, message: 'Referral code is invalid or inactive.' });
        }

        return res.status(200).json({
            valid: true,
            code: ref.code,
            panitiaName: ref.panitiaName
        });
    } catch (error) {
        return sendError(error, req, res);
    }
};

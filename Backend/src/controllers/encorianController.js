import { sendError } from '../middleware/errorHandler.js';
import Encorian from '../models/Encorian.js';
import Ticket from '../models/Ticket.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { sendTicketEmail } from '../services/emailService.js';
import { isValidObjectId, normalizeEmail, normalizeString } from '../utils/security.js';

// Helper to delete uploaded bukti transfer if validation fails
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
        console.warn("Failed to delete uploaded transfer proof:", err.message);
    }
};

// CREATE ENCORIAN -- POST /encorians
export const createEncorian = async (req, res) => {
    try {
        const name = normalizeString(req.body.name, { max: 120, required: true });
        const email = normalizeEmail(req.body.email);
        const phone = normalizeString(req.body.phone, { max: 20, required: true });

        if (!name || !email || !phone || !req.file) {
            if (req.file) await deleteUploadedTransfer(req.file.filename);
            const errors = {};
            if (!name) errors.name = 'Enter your name (1 to 120 characters).';
            if (!email) errors.email = 'Enter a valid email address, such as name@example.com (up to 254 characters).';
            if (!phone) errors.phone = 'Enter your phone number (1 to 20 characters).';
            if (!req.file) errors.buktiTransfer = 'Upload your transfer proof as a JPG, JPEG, or PNG image up to 5 MB.';
            return res.status(400).json({ message: Object.values(errors).join(' '), errors });
        }

        const buktiTransfer = `/uploads/transfer/${req.file.filename}`;

        const newEncorian = await Encorian.create({
            name,
            email,
            phone,
            buktiTransfer,
            status: 'pending'
        });

        return res.status(201).json({
            message: 'Your ticket request has been submitted and is awaiting approval.',
            encorian: {
                _id: newEncorian._id,
                name: newEncorian.name,
                email: newEncorian.email,
                phone: newEncorian.phone,
                status: newEncorian.status,
                createdAt: newEncorian.createdAt
            }
        });

    } catch (error) {
        if (req.file) await deleteUploadedTransfer(req.file.filename);
        return sendError(error, req, res);
    }
};

// LIST ENCORIANS -- GET /admin/encorians
export const getEncorians = async (req, res) => {
    try {
        const query = {};
        const { status } = req.query;

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
        }

        const encorians = await Encorian.find(query)
            .select('name email phone status buktiTransfer createdAt')
            .sort({ createdAt: -1 })
            .limit(1000);

        return res.status(200).json(encorians);

    } catch (error) {
        return sendError(error, req, res);
    }
};

// GET ENCORIAN BY ID -- GET /admin/encorians/:id
export const getEncorianById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid encorian id' });
        }

        const encorian = await Encorian.findById(req.params.id);

        if (!encorian) {
            return res.status(404).json({ message: 'Ticket request not found' });
        }

        return res.status(200).json(encorian);

    } catch (error) {
        return sendError(error, req, res);
    }
};

// APPROVE ENCORIAN -- PATCH /admin/encorians/:id/approve
export const approveEncorian = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid encorian id' });
        }

        const encorian = await Encorian.findById(req.params.id);

        if (!encorian) {
            return res.status(404).json({ message: 'Ticket request not found' });
        }

        if (encorian.status === 'approved') {
            return res.status(409).json({ message: 'This ticket request has already been approved.' });
        }

        if (encorian.status === 'rejected') {
            return res.status(409).json({ message: 'This ticket request has been rejected and cannot be approved.' });
        }

        // Idempotency: check if a ticket already exists for this encorian
        const existingTicket = await Ticket.findOne({ encorianId: encorian._id });
        if (existingTicket) {
            return res.status(409).json({ message: 'A ticket has already been created for this request.' });
        }

        // Generate unique ticket code
        const ticketCode = `ENC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

        // Generate QR code as base64 data URL (contains only ticketCode, no sensitive data)
        let qrCode;
        try {
            qrCode = await QRCode.toDataURL(ticketCode, {
                width: 300,
                margin: 2,
                errorCorrectionLevel: 'M'
            });
        } catch (qrError) {
            console.error('Failed to generate QR code:', qrError.message);
            return res.status(500).json({ message: 'Failed to generate QR code. Please try again.' });
        }

        // Create ticket
        const ticket = await Ticket.create({
            encorianId: encorian._id,
            ticketCode,
            qrCode,
            status: 'valid'
        });

        // Update encorian status to approved
        encorian.status = 'approved';
        await encorian.save();

        // Send email with QR code
        try {
            await sendTicketEmail(encorian, ticket);
        } catch (emailError) {
            console.error('Failed to send ticket email:', emailError.message);
            return res.status(207).json({
                message: 'Ticket created and approved, but the email could not be sent. The ticket is still valid.',
                ticket: {
                    _id: ticket._id,
                    ticketCode: ticket.ticketCode,
                    status: ticket.status
                }
            });
        }

        return res.status(200).json({
            message: 'Ticket request approved. Ticket created and email sent.',
            ticket: {
                _id: ticket._id,
                ticketCode: ticket.ticketCode,
                status: ticket.status
            }
        });

    } catch (error) {
        return sendError(error, req, res);
    }
};

// REJECT ENCORIAN -- PATCH /admin/encorians/:id/reject
export const rejectEncorian = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid encorian id' });
        }

        const encorian = await Encorian.findById(req.params.id);
        if (!encorian) {
            return res.status(404).json({ message: 'Ticket request not found' });
        }
        if (encorian.status === 'rejected') {
            return res.status(409).json({ message: 'This ticket request has already been rejected.' });
        }
        if (encorian.status === 'approved') {
            return res.status(409).json({ message: 'This ticket request has already been approved and cannot be rejected.' });
        }

        encorian.status = 'rejected';
        await encorian.save();
        return res.status(200).json({
            message: 'Ticket request has been rejected.'
        });

    } catch (error) {
        return sendError(error, req, res);
    }
};

// RESEND TICKET EMAIL -- PATCH /admin/encorians/:id/resend-email
export const resendEmail = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid encorian id' });
        }
        const encorian = await Encorian.findById(req.params.id);

        if (!encorian) {
            return res.status(404).json({ message: 'Ticket request not found' });
        }

        if (encorian.status !== 'approved') {
            return res.status(409).json({ message: 'Only approved ticket requests can receive an email.' });
        }
        const ticket = await Ticket.findOne({ encorianId: encorian._id });

        if (!ticket) {
            return res.status(404).json({ message: 'No ticket found for this request. Approve the request first.' });
        }
        await sendTicketEmail(encorian, ticket);

        return res.status(200).json({
            message: 'Ticket email has been resent.'
        });

    } catch (error) {
        return sendError(error, req, res);
    }
};

// LOOKUP TICKET -- GET /admin/encorians/ticket/:ticketCode
export const lookupTicket = async (req, res) => {
    try {
        const { ticketCode } = req.params;
        if (!ticketCode || typeof ticketCode !== 'string' || ticketCode.trim() === '') {
            return res.status(400).json({ message: 'Ticket code is required.' });
        }

        const ticket = await Ticket.findOne({ ticketCode }).populate('encorianId', 'name email phone');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        return res.status(200).json({
            ticket: {
                _id: ticket._id,
                ticketCode: ticket.ticketCode,
                status: ticket.status,
                usedAt: ticket.usedAt,
                createdAt: ticket.createdAt
            },
            encorian: ticket.encorianId || null
        });

    } catch (error) {
        return sendError(error, req, res);
    }
};

// CHECK-IN TICKET -- PATCH /admin/encorians/check-in
export const checkInTicket = async (req, res) => {
    try {
        const { ticketCode } = req.body;
        if (!ticketCode || typeof ticketCode !== 'string' || ticketCode.trim() === '') {
            return res.status(400).json({ message: 'Ticket code is required.' });
        }

        const now = new Date();
        const ticket = await Ticket.findOneAndUpdate(
            { ticketCode, status: 'valid' },
            { $set: { status: 'used', usedAt: now } },
            { new: true }
        ).populate('encorianId', 'name email phone');

        if (ticket) {
            return res.status(200).json({
                message: 'Check-in successful.',
                ticket: {
                    _id: ticket._id,
                    ticketCode: ticket.ticketCode,
                    status: ticket.status,
                    usedAt: ticket.usedAt,
                    createdAt: ticket.createdAt
                },
                encorian: ticket.encorianId || null
            });
        }

        const existingTicket = await Ticket.findOne({ ticketCode });

        if (!existingTicket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        if (existingTicket.status === 'used') {
            return res.status(409).json({
                message: 'This ticket has already been used.',
                ticket: {
                    ticketCode: existingTicket.ticketCode,
                    status: existingTicket.status,
                    usedAt: existingTicket.usedAt
                }
            });
        }

        if (existingTicket.status === 'cancelled') {
            return res.status(409).json({
                message: 'This ticket has been cancelled.',
                ticket: {
                    ticketCode: existingTicket.ticketCode,
                    status: existingTicket.status
                }
            });
        }

        return res.status(409).json({
            message: 'This ticket cannot be used for check-in.',
            ticket: {
                ticketCode: existingTicket.ticketCode,
                status: existingTicket.status
            }
        });

    } catch (error) {
        return sendError(error, req, res);
    }
};

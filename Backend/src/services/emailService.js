import nodemailer from 'nodemailer';
import sharp from 'sharp';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        logger: true,
        debug: true
    });
};

export const generateTicketImage = async (ticketCode) => {
    try {
        // Resolve path relative to this file, or fallback to cwd
        let templatePath = path.join(__dirname, '..', 'assets', 'the-encore-template.jpg');
        if (!fs.existsSync(templatePath)) {
            templatePath = path.join(process.cwd(), 'src', 'assets', 'the-encore-template.jpg');
        }
        if (!fs.existsSync(templatePath)) {
            templatePath = path.join(process.cwd(), 'Backend', 'src', 'assets', 'the-encore-template.jpg');
        }

        if (!fs.existsSync(templatePath)) {
            console.warn('Ticket template file not found at:', templatePath);
            return null;
        }

        const qrSize = 180;
        const qrBuffer = await QRCode.toBuffer(ticketCode, {
            width: qrSize,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' }
        });

        const cardW = 204;
        const cardH = 224;
        const cardSvg = Buffer.from(`
            <svg width="${cardW}" height="${cardH}">
                <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="12" ry="12" fill="#ffffff" stroke="#ec4899" stroke-width="2" />
                <text x="${cardW / 2}" y="${cardH - 10}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1a1a1a" text-anchor="middle">${ticketCode}</text>
            </svg>
        `);

        const cardWithQr = await sharp(cardSvg)
            .composite([{ input: qrBuffer, left: 12, top: 10 }])
            .png()
            .toBuffer();

        const leftPos = Math.round(865 - (cardW / 2));
        const topPos = Math.round((409 - cardH) / 2);

        return await sharp(templatePath)
            .composite([{
                input: cardWithQr,
                left: leftPos,
                top: topPos
            }])
            .jpeg({ quality: 95 })
            .toBuffer();
    } catch (err) {
        console.warn('Failed to composite ticket image, falling back to basic QR code:', err.message);
        return null;
    }
};

export const sendTicketEmail = async (encorian, ticket) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.error('Email sending aborted: SMTP_HOST, SMTP_USER, or SMTP_PASS is missing in Backend/.env');
        throw new Error('Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env');
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    // Generate full styled ticket image
    const ticketImageBuffer = await generateTicketImage(ticket.ticketCode);

    // Raw qrCode backup as base64 data URL
    const rawQrBase64 = ticket.qrCode.replace(/^data:image\/png;base64,/, '');

    const attachments = [];
    let ticketDisplayHtml = '';

    if (ticketImageBuffer) {
        attachments.push({
            filename: `The-Encore-Ticket-${ticket.ticketCode}.jpg`,
            content: ticketImageBuffer,
            cid: 'eticket'
        });
        ticketDisplayHtml = `
            <div style="text-align: center; margin: 24px 0;">
                <img src="cid:eticket" alt="The Encore E-Ticket" style="width: 100%; max-width: 600px; height: auto; border-radius: 12px; display: block; margin: 0 auto;" />
            </div>
        `;
    } else {
        attachments.push({
            filename: 'qrcode.png',
            content: rawQrBase64,
            encoding: 'base64',
            cid: 'qrcode'
        });
        ticketDisplayHtml = `
            <div style="text-align: center; margin: 32px 0;">
                <p style="font-size: 14px; color: #666; margin-bottom: 8px;">Ticket Code</p>
                <p style="font-size: 20px; font-weight: bold; color: #1a1a1a; letter-spacing: 1px;">${ticket.ticketCode}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <img src="cid:qrcode" alt="QR Code" width="250" height="250" style="border: 1px solid #eee; border-radius: 8px;" />
            </div>
        `;
    }

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1a1a1a;">
            <h1 style="text-align: center; color: #ec4899; margin-bottom: 4px;">The Encore</h1>
            <h2 style="text-align: center; color: #333; margin-top: 0; font-weight: normal; font-size: 18px;">Your Official E-Ticket</h2>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p>Hi <strong>${encorian.name}</strong>,</p>
            <p>Your ticket request has been approved! Here is your official e-ticket for <strong>The Encore</strong>:</p>
            
            ${ticketDisplayHtml}

            <div style="background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; color: #831843;">
                <p style="margin: 0 0 8px 0;"><strong>Event Details:</strong></p>
                <p style="margin: 0 0 4px 0;">📅 <strong>Date:</strong> 31 October 2026</p>
                <p style="margin: 0 0 4px 0;">⏰ <strong>Open Gate:</strong> 16.30 PM</p>
                <p style="margin: 0 0 4px 0;">📍 <strong>Location:</strong> Bagi Kopi Karawaci</p>
                <p style="margin: 8px 0 0 0;">🎟️ <strong>Ticket Code:</strong> ${ticket.ticketCode}</p>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px;">Show the QR code on your ticket at the gate for check-in.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="text-align: center; color: #999; font-size: 12px;">This is an automated email from Radioactive 2026. Please do not reply.</p>
        </div>
    `;

    await transporter.sendMail({
        from,
        to: encorian.email,
        subject: `The Encore — Your E-Ticket (${ticket.ticketCode})`,
        html,
        attachments
    });
};

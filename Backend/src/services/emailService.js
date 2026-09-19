import nodemailer from 'nodemailer';

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
        logger: true, // Tambahkan baris ini
        debug: true // Tambahkan baris ini
    });
};

export const sendTicketEmail = async (encorian, ticket) => {
    const transporter = createTransporter();

    if (!transporter) {
        throw new Error('Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env');
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    // qrCode is stored as a base64 data URL (data:image/png;base64,...)
    const base64Data = ticket.qrCode.replace(/^data:image\/png;base64,/, '');

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h1 style="text-align: center; color: #1a1a1a;">The Encore</h1>
            <h2 style="text-align: center; color: #333;">Your E-Ticket</h2>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
            <p>Hi <strong>${encorian.name}</strong>,</p>
            <p>Your ticket has been approved! Here is your e-ticket for <strong>The Encore</strong>.</p>
            <div style="text-align: center; margin: 32px 0;">
                <p style="font-size: 14px; color: #666; margin-bottom: 8px;">Ticket Code</p>
                <p style="font-size: 20px; font-weight: bold; color: #1a1a1a; letter-spacing: 1px;">${ticket.ticketCode}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <img src="cid:qrcode" alt="QR Code" width="250" height="250" style="border: 1px solid #eee; border-radius: 8px;" />
            </div>
            <p style="text-align: center; color: #666; font-size: 14px;">Show this QR code at check-in to enter the event.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
            <p style="text-align: center; color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
    `;

    await transporter.sendMail({
        from,
        to: encorian.email,
        subject: 'The Encore — Your E-Ticket',
        html,
        attachments: [
            {
                filename: 'qrcode.png',
                content: base64Data,
                encoding: 'base64',
                cid: 'qrcode'
            }
        ]
    });
};

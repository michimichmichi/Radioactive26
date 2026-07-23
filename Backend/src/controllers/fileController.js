import fs from 'fs';
import path from 'path';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { isSafeUploadFilename } from '../utils/security.js';

const UPLOAD_FOLDERS = new Set(['ktm', 'transfer']);

export const serveUpload = async (req, res) => {
    const { folder, filename } = req.params;

    if (!UPLOAD_FOLDERS.has(folder) || !isSafeUploadFilename(filename)) {
        return res.status(404).json({ message: 'File not found' });
    }

    const relativePath = `/uploads/${folder}/${filename}`;
    let authorized = req.user.role === 'admin';

    if (!authorized && folder === 'ktm') {
        authorized = Boolean(await User.exists({ _id: req.user.id, ktm: relativePath }));
    }

    if (!authorized && folder === 'transfer') {
        authorized = Boolean(await Team.exists({
            buktiTransfer: relativePath,
            $or: [{ leaderId: req.user.id }, { members: req.user.id }]
        }));
    }

    if (!authorized) {
        return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.resolve(process.cwd(), 'src', 'uploads', folder, filename);

    if (!filePath.startsWith(path.resolve(process.cwd(), 'src', 'uploads') + path.sep)) {
        return res.status(404).json({ message: 'File not found' });
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.sendFile(filePath);
};

import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';
import multer from 'multer';
import path from 'path';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png'
};
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

const isAllowedImageSignature = (buffer, mimetype) => {
    const isPng =
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a;

    const isJpeg =
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff;

    if (mimetype === 'image/png') return isPng;
    return mimetype === 'image/jpeg' || mimetype === 'image/jpg'
        ? isJpeg
        : false;
};

export const createSecureImageUpload = (folderName) => {
    const uploadDir = path.resolve(process.cwd(), 'src', 'uploads', folderName);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const extension = ALLOWED_IMAGE_TYPES[file.mimetype];
            cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (
            ALLOWED_IMAGE_TYPES[file.mimetype] &&
            ALLOWED_EXTENSIONS.includes(extension)
        ) {
            cb(null, true);
            return;
        }

        cb(new Error('Only JPG, JPEG, and PNG files are allowed'));
    };

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: MAX_IMAGE_SIZE,
            files: 1
        }
    });

    const validateUploadedImage = async (req, res, next) => {
        if (!req.file) {
            next();
            return;
        }

        const filePath = path.resolve(req.file.path);

        if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
            await fsp.unlink(filePath).catch(() => {});
            return res.status(400).json({ message: 'Invalid upload path' });
        }

        const file = await fsp.open(filePath, 'r');
        const signature = Buffer.alloc(8);

        try {
            await file.read(signature, 0, signature.length, 0);
        } finally {
            await file.close();
        }

        if (!isAllowedImageSignature(signature, req.file.mimetype)) {
            await fsp.unlink(filePath).catch(() => {});
            return res.status(400).json({
                message: 'Uploaded file content must be a valid JPG, JPEG, or PNG image'
            });
        }

        next();
    };

    return {
        upload,
        validateUploadedImage
    };
};

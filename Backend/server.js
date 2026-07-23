import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';    
import connectDB from './src/config/db.js';
import teamRoutes from "./src/routes/teamRoutes.js";
import competitionRoutes from "./src/routes/competitionRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import fileRoutes from "./src/routes/fileRoutes.js";
import { rateLimiter } from './src/middleware/rateLimiter.js';

dotenv.config(); 
connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000;
const configuredOrigins = process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN;
const CLIENT_ORIGINS = new Set(
    (configuredOrigins
        ? configuredOrigins.split(',')
        : ['https://radioactive26.com', 'https://www.radioactive26.com', 'http://localhost:5173'])
        .map((origin) => origin.trim())
        .filter(Boolean)
);
const TRUST_PROXY = Number(process.env.TRUST_PROXY || 0); // Set trust proxy jadi 1 kalo misalnya udh nnti kalo udh mau deploy ke server biar dpt IP User, kalo msh local jadiin 0 aja dl
const apiLimiter = rateLimiter({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 300,
    keyPrefix: 'api'
});
const authLimiter = rateLimiter({
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 20,
    message: 'Too many authentication attempts. Please try again later.',
    keyPrefix: 'auth'
});

app.set('trust proxy', TRUST_PROXY);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || CLIENT_ORIGINS.has(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin is not allowed'));
    },
    credentials: true
})); 
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const origin = req.get('origin');
        if (origin && !CLIENT_ORIGINS.has(origin)) {
            return res.status(403).json({ message: 'Request origin is not allowed' });
        }
    }

    next();
});
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb', parameterLimit: 100 }));
app.use(apiLimiter);
app.use('/uploads', fileRoutes);
app.use('/users/login', authLimiter);
app.use('/users/register', authLimiter);
app.use("/teams", teamRoutes);
app.use("/competitions", competitionRoutes);
app.use("/users", userRoutes);

app.use((err, req, res, next) => {
    if (!err) {
        next();
        return;
    }

    const uploadErrorCodes = [
        'LIMIT_FILE_SIZE',
        'LIMIT_FILE_COUNT',
        'LIMIT_UNEXPECTED_FILE'
    ];
    const status = uploadErrorCodes.includes(err.code) ? 400 : 400;

    if (err.message === 'Origin is not allowed') {
        return res.status(403).json({ message: 'Request origin is not allowed' });
    }

    return res.status(status).json({
        message: err.code === 'LIMIT_FILE_SIZE'
            ? 'Uploaded file must be 5MB or smaller'
            : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
                ? 'Invalid upload'
                : process.env.NODE_ENV === 'production'
                    ? 'Request could not be completed'
                    : err.message || 'Request could not be completed'
    });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on port ${PORT}`);
});

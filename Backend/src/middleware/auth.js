import { sendError } from './errorHandler.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'radioactive26-api';
let hasWarnedWeakSecret = false;

const parseCookies = (header = '') => Object.fromEntries(
    header.split(';').map((part) => part.trim().split('='))
        .filter(([key, value]) => key && value)
        .map(([key, ...value]) => [key, decodeURIComponent(value.join('='))])
);

export const setAuthCookie = (res, token) => {
    const secure = process.env.COOKIE_SECURE === 'false' ? '' : '; Secure';
    res.setHeader(
        'Set-Cookie',
        `radioactive_token=${encodeURIComponent(token)}; Max-Age=43200; Path=/; HttpOnly${secure}; SameSite=Strict`
    );
};

export const clearAuthCookie = (res) => {
    const secure = process.env.COOKIE_SECURE === 'false' ? '' : '; Secure';
    res.setHeader(
        'Set-Cookie',
        `radioactive_token=; Max-Age=0; Path=/${secure}; HttpOnly; SameSite=Strict`
    );
};

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    if (!hasWarnedWeakSecret && process.env.JWT_SECRET.length < 32) {
        hasWarnedWeakSecret = true;
        console.warn('JWT_SECRET should be at least 32 characters long.');
    }

    return process.env.JWT_SECRET;
};

// Generate Token
export const generateToken = (user) => {
    return jwt.sign(
        {
            sub: user._id.toString(),
            id: user._id,
            email: user.email,
            role: user.role || 'user',
            tokenVersion: user.tokenVersion || 0
        },
        getJwtSecret(),
        {
            algorithm: JWT_ALGORITHM,
            expiresIn: TOKEN_EXPIRES_IN,
            issuer: JWT_ISSUER
        }
    );
};

// Verify Token
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookies = parseCookies(req.headers.cookie);

        const token = cookies.radioactive_token ||
            (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

        if (!token) {
            return res.status(401).json({
                message: 'Please log in to continue.'
            });
        }

        const decoded = jwt.verify(token, getJwtSecret(), {
            algorithms: [JWT_ALGORITHM],
            issuer: JWT_ISSUER
        });
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'This account is no longer available. Contact the organizers for help.'
            });
        }

        if ((decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
            return res.status(401).json({
                message: 'Your session has ended. Please log in again.'
            });
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: user.role || 'user'
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Your session has expired. Please log in again.'
            });
        }

        if (['JsonWebTokenError', 'NotBeforeError', 'URIError'].includes(error.name)) {
            return res.status(401).json({ message: 'Your session is invalid. Please log in again.' });
        }
        return sendError(error, req, res);
    }
};

// Used by logout: authenticate when possible, but never block cookie removal.
export const optionalVerifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.radioactive_token ||
            (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

        if (!token) return next();

        const decoded = jwt.verify(token, getJwtSecret(), {
            algorithms: [JWT_ALGORITHM],
            issuer: JWT_ISSUER
        });
        const user = await User.findById(decoded.id).select('-password');

        if (user && (decoded.tokenVersion || 0) === (user.tokenVersion || 0)) {
            req.user = {
                id: user._id,
                email: user.email,
                role: user.role || 'user'
            };
        }
    } catch {
        // An expired or invalid token should not prevent logout.
    }

    next();
};

export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: 'Please log in to continue.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Your account does not have permission to do this. Please use an admin account.'
            });
        }

        next();
    };
};

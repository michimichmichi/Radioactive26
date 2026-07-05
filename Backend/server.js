import express from 'express';
import path from "path";
import cors from 'cors';
import dotenv from 'dotenv';    
import connectDB from './src/config/db.js';
import teamRoutes from "./src/routes/teamRoutes.js";
import competitionRoutes from "./src/routes/competitionRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import { rateLimiter } from './src/middleware/rateLimiter.js';

dotenv.config(); 
connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
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
    origin: CLIENT_ORIGIN,
    credentials: false
})); 
app.use(
    "/uploads",
    express.static(path.join("src", "uploads"))
);
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use("/api/teams", teamRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

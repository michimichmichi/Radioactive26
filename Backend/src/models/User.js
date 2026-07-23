import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 254
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    },
    tokenVersion: {
        type: Number,
        default: 0,
        required: true
    },
    university: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160
    },
    nim: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 50
    },
    ktm: {
        type: String,
    },
}, { timestamps: true });

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
        required: true
    },
    nim: {
        type: String,
        required: true,
        unique: true
    },
    ktm: {
        type: String,
    },
}, { timestamps: true });

export default mongoose.model('User', userSchema);

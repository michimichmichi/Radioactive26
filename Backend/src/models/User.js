import mongoose from 'mongoose';

const user = new mongoose.Schema({
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
    university: {
        type: String,
        required: true
    },
    ktm: {
        type: String,
    },
}, { timestamps: true });

export default mongoose.model('User', user);
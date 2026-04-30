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
    university: {
        type: String,
        required: true
    },
    ktm: {
        type: String,
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('User', user);
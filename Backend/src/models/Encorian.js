import mongoose from 'mongoose';

const encorianSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        maxlength: 254
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    buktiTransfer: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Encorian', encorianSchema);
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    encorianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encorian'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ticketCode: {
        type: String,
        required: true, unique: true
    },
    qrCode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['valid', 'used', 'cancelled'],
        default: 'valid',
        required: true
    },
    usedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
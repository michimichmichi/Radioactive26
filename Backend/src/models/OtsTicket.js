import mongoose from 'mongoose';

const otsTicketSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    pricePerTicket: {
        type: Number,
        required: true,
        default: 35000,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'qris', 'transfer', 'other'],
        default: 'cash',
        required: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 300,
        default: ''
    },
    recordedBy: {
        type: String,
        trim: true,
        default: 'Admin'
    },
    referralCode: {
        type: String,
        trim: true,
        uppercase: true,
        default: null
    },
    committeeName: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('OtsTicket', otsTicketSchema);

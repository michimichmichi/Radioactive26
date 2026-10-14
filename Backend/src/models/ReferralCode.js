import mongoose from 'mongoose';

const referralCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: 30
    },
    panitiaName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    targetQuota: {
        type: Number,
        required: true,
        default: 10,
        min: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('ReferralCode', referralCodeSchema);

import mongoose from 'mongoose';

const compSchema = new mongoose.Schema({
    competitionName: {
        type: String,
        required: true,
        unique: true
    },
    time: {
        type: Date,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    termsAndConditions: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Competition', compSchema);
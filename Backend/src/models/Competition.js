import mongoose from 'mongoose';

const compSchema = new mongoose.Schema({
    competitionName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 120
    },
    time: {
        type: Date,
        required: true
    },
    place: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    termsAndConditions: {
        type: String,
        required: true,
        maxlength: 5000
    }
}, { timestamps: true });

export default mongoose.model('Competition', compSchema);

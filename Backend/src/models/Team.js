import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        unique: true
    },
    leaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    competitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    buktiTransfer: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
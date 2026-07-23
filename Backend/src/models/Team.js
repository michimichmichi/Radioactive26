import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 120
    },
    leaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        validate: {
            validator: (members) => members.length <= 50,
            message: 'A team cannot have more than 50 members'
        }
    },
    competitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    buktiTransfer: {
        type: String,
        //required: true  --> gabisa krn nanti tim gabisa dibuat tanpa bukti tf
    }
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);

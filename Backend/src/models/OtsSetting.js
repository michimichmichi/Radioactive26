import mongoose from 'mongoose';

const otsSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'default'
    },
    defaultPrice: {
        type: Number,
        required: true,
        default: 35000,
        min: 0
    }
}, { timestamps: true });

export default mongoose.model('OtsSetting', otsSettingSchema);

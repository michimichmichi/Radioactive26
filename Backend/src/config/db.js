import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        //await = menunggu koneksi selesai sebelum melanjutkan ke baris berikutnya
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB; // Cara export di ES Modules (import/export)
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('Error: MONGO_URI is not defined in your Backend/.env file.');
            console.error('Please create a .env file in the Backend folder with:');
            console.error('  MONGO_URI=mongodb://localhost:27017/radioactive26 (or your MongoDB Atlas URI)');
            process.exit(1);
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB; // Cara export di ES Modules (import/export)
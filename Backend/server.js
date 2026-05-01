import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';    
import connectDB from './src/config/db.js';
import teamRoutes from "./src/routes/teamRoutes.js";

dotenv.config(); 
connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use("/api/teams", teamRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


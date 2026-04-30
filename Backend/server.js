import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); //enable cross-origin requests
app.use(express.json()); //read request body as JSON

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
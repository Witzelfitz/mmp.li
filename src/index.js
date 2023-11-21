import { connectDB } from './db/index.js';
import express from 'express';
import { leaderboardRouter } from './db/routes/leaderboards.js';

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Configure Express app
app.use(express.json());

// Define routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/leaderboards', leaderboardRouter);

// Start Express app
const port = 3000;
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

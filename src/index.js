import { connectDB } from './db/index.js';
import express from 'express';
import { leaderboardRouter } from './db/routes/leaderboards.js';
import { notesRouter } from './db/routes/notes.js';
import cors from 'cors';
import config from './config.js';

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Configure Express app
app.use(express.json());
app.use(cors());
app.use(express.static('public'));


app.use('/leaderboards', leaderboardRouter);
app.use('/notes', notesRouter);

// Start Express app
const port = config.Port;
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

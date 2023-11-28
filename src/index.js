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

// Define routes
app.get('/', (req, res) => {
    res.send(`
        <h1>Willkommen bei der Leaderboards API</h1>
        <p>Hier kannst du die Leaderboards nutzen:</p>
        <h2>Get</h2>
        <ul>
            <li><a href="/leaderboards">/leaderboards</a>: Hier sind sämtliche Leaderboards aufgelistet</li>
            <li><a href="/leaderboards/:id">/leaderboards/:id</a>: So wird ein einzelnes Leaderboard aufgerufen (:id muss durch einen string ersetzt werden)</li>
        </ul>
        <h2>Post</h2>
        <ul>
            <li><a href="/leaderboards/">/leaderboards</a>: Hier kannst du ein neues Leaderboard erstellen.<br> {
                "projectId": "blub",
                "name": "Beni",
                "score": 45
            }</li>
        </ul>
        <h1>Willkommen bei der Notes API</h1>
        <p>Hier kannst du die Notes nutzen:</p>
        <h2>Get</h2>
        <ul>
            <li><a href="/notes">/notes</a>: Hier sind sämtliche Notes aufgelistet</li>
            <li><a href="/notes/:id">/notes/:id</a>: So wird eine einzelne Note aufgerufen (:id muss durch einen string ersetzt werden)</li>
        </ul>
        <h2>Post</h2>
        <ul>
            <li><a href="/notes/">/notes</a>: Hier kannst du eine neue Note erstellen.<br> {
                "projectId": "blub",
                "title": "blub",
                "text": "Beni"
            }</li>
        </ul>
        <h2>Put</h2>
        <ul>
            <li><a href="/notes/entry/:id">/notes/entry/:id</a>: Hier kannst du einen Eintrag bearbeiten<br> {
                "title": "blub",
                "text": "Beni"
            }</li>
    `);
});

app.use('/leaderboards', leaderboardRouter);
app.use('/notes', notesRouter);

// Start Express app
const port = config.Port;
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

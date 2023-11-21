import express from 'express';
import {Leaderboard, validateLeaderboard } from '../models/Leaderboard.js';

const router = express.Router();

// Get all leaderboards from database
router.get('/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const leaderboards = await Leaderboard.find({ projectId }).sort('score');
    res.send(leaderboards);
});

// Create a new leaderboard
router.post('/', async (req, res) => {
    const { error } = validateLeaderboard(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const { projectId, name, score } = req.body;

    // Construct the entry object
    const newEntry = { name, score };

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };

    try {
        const leaderboard = await Leaderboard.findOneAndUpdate(
            { projectId },
            { $push: { entries: newEntry } }, // Push the new entry
            options
        );
        res.send(leaderboard);
    } catch (e) {
        res.status(500).send('An error occurred: ' + e.message);
    }
});

export { router as leaderboardRouter };
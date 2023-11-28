import express from 'express';
import {Leaderboard, validateLeaderboard } from '../models/leaderboard.js';

const router = express.Router();

// Get all leaderboards from database
router.get('/', async (req, res) => {
    const leaderboards = await Leaderboard.find();
    res.send(leaderboards);
});

// Get all leaderboards from database
router.get('/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const leaderboard = await Leaderboard.findOne({ projectId });
    if (!leaderboard) {
        return res.status(404).send(`Leaderboard ${projectId} not found`);
    }
    res.send(leaderboard);
});

// Delete a leaderboard
router.delete('/delete/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const leaderboard = await Leaderboard.findOneAndDelete({ projectId });
    if (!leaderboard) {
        return res.status(404).send(`Leaderboard ${projectId} not found`);
    }
    res.send(leaderboard);
});


// Create a new leaderboard
router.post('/', async (req, res) => {
    const { error } = validateLeaderboard(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let { projectId, name, score } = req.body;
    projectId = projectId.replace(/\s+/g, '');


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
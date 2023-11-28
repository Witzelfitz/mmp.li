import mongoose from 'mongoose';
import Joi from 'joi';

const entrySchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 20 },
    score: { type: Number, required: true }
});

const leaderboardSchema = new mongoose.Schema({
    projectId: { type: String, required: true, ref: 'Project', index: true },
    entries: [entrySchema]  // Array of entry subdocuments
});

function validateLeaderboard(entry) {
    const schema = Joi.object({
        projectId: Joi.string().required(),
        name: Joi.string().required().max(20),
        score: Joi.number().required()
    });
    return schema.validate(entry);
}


//Schema
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export { Leaderboard, leaderboardSchema, validateLeaderboard };

// Path: routes/leaderboard.js

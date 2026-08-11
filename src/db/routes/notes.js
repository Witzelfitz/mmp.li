import express from 'express';
import mongoose from 'mongoose';
import { Note, validateNote } from '../models/note.js';

const router = express.Router();

// Alle Notizen aus der Datenbank abrufen
router.get('/', async (req, res) => {
    const notes = await Note.find();
    res.send(notes);
});

// Eine spezifische Notiz anhand ihrer ID abrufen
router.get('/:noteId', async (req, res) => {
    const noteId = req.params.noteId;
    const note = await Note.findOne({ noteId });
    if (!note) {
        return res.status(404).send(`Note with ID ${noteId} not found`);
    }
    res.send(note);
});

async function deleteNote(req, res) {
    const noteId = req.params.noteId;
    const note = await Note.findOneAndDelete({ noteId });
    if (!note) {
        return res.status(404).send(`Note with ID ${noteId} not found`);
    }
    return res.send(note);
}

// REST route plus backwards-compatible legacy route
router.delete('/:noteId', deleteNote);
router.delete('/delete/:noteId', deleteNote);

// Eine neue Notiz erstellen
router.post('/', async (req, res) => {
    const { title, text } = req.body;
    const noteId = typeof req.body.noteId === 'string'
        ? req.body.noteId.replace(/\s+/g, '')
        : '';
    
    const noteData = {
        noteId,
        entries: [{ title, text }]
    };

    const { error } = validateNote(noteData);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const newEntry = { title, text };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };

    try {
        const note = await Note.findOneAndUpdate(
            { noteId },
            { $push: { entries: newEntry } },
            options
        );
        res.send(note);
    } catch (e) {
        res.status(500).send('An error occurred: ' + e.message);
    }
});

router.put('/entry/:entryId', async (req, res) => {
    const entryId = req.params.entryId;
    const { title, text } = req.body;

    if (!mongoose.isObjectIdOrHexString(entryId)) {
        return res.status(400).json({ error: 'Invalid entry ID' });
    }

    if (!title || !text) {
        return res.status(400).send('Title and text are required.');
    }

    if (title.length > 20 || text.length > 200) {
        return res.status(400).send('Title must be at most 20 and text at most 200 characters.');
    }

    try {
        const note = await Note.findOneAndUpdate(
            { "entries._id": entryId },
            { 
                $set: {
                    "entries.$.title": title,
                    "entries.$.text": text
                }
            },
            { new: true }
        );

        if (!note) {
            return res.status(404).send(`Entry with ID ${entryId} not found`);
        }

        res.send(note);
    } catch (e) {
        console.error('Could not update note entry:', e);
        res.status(500).json({ error: 'Could not update note entry' });
    }
});


export { router as notesRouter };

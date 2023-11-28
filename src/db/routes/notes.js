import express from 'express';
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

// Eine Notiz löschen
router.delete('/delete/:noteId', async (req, res) => {
    const noteId = req.params.noteId;
    const note = await Note.findOneAndDelete({ noteId });
    if (!note) {
        return res.status(404).send(`Note with ID ${noteId} not found`);
    }
    res.send(note);
});

// Eine neue Notiz erstellen
router.post('/', async (req, res) => {
    let { noteId, title, text } = req.body;
    noteId = noteId.replace(/\s+/g, '');
    
    // Packen Sie den 'title' und 'text' in ein 'entries'-Array
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

    // Validierung (optional, kann nach Bedarf angepasst werden)
    if (!title || !text) {
        return res.status(400).send('Title and text are required.');
    }

    try {
        // Finden und Aktualisieren des Eintrags in der Notiz
        const note = await Note.findOneAndUpdate(
            { "entries._id": entryId },
            { 
                $set: {
                    "entries.$.title": title,
                    "entries.$.text": text
                }
            },
            { new: true } // Gibt das aktualisierte Dokument zurück
        );

        if (!note) {
            return res.status(404).send(`Entry with ID ${entryId} not found`);
        }

        res.send(note);
    } catch (e) {
        res.status(500).send('An error occurred: ' + e.message);
    }
});


export { router as notesRouter };

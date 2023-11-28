import mongoose from 'mongoose';
import Joi from 'joi';

// Eintrags-Schema
const entrySchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 20 },
    text: { type: String, required: true, maxlength: 200 }
});

// Notiz-Schema
const noteSchema = new mongoose.Schema({
    noteId: { type: String, required: true, unique: true },
    entries: [entrySchema]  // Array von Eintrags-Subdokumenten
});

// Validierungsfunktion für Notizen
function validateNote(note) {
    const schema = Joi.object({
        noteId: Joi.string().required(),
        entries: Joi.array().items(Joi.object({
            title: Joi.string().required().max(20),
            text: Joi.string().required().max(200)
        }))
    });
    return schema.validate(note);
}

// Notiz-Modell
const Note = mongoose.model('Note', noteSchema);

// Export
export { Note, validateNote };

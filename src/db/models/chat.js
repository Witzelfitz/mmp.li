import mongoose from 'mongoose';
import Joi from 'joi';

// Define messageSchema first
const messageSchema = new mongoose.Schema({
    randomName: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Then define chatSchema that uses messageSchema
const chatSchema = new mongoose.Schema({
    roomId: { type: String, required: true, ref: 'ChatRoom', index: true },
    messages: [messageSchema]
});

function validateChat(chat) {
    const schema = Joi.object({
        roomId: Joi.string().required(),
        messages: Joi.array()
    });
    return schema.validate(chat);
}

function validateMessage(message) {
    const schema = Joi.object({
        content: Joi.string().required()
    });
    return schema.validate(message);
}

// Utility function to generate a random name
function generateRandomName() {
    const firstNames = [
        "Luca", "Mia", "Noah", "Emma", "Lina", "Liam", "Elena", "Lea", "Elias", "Sophie",
        "Nina", "Jonas", "Nora", "David", "Anna", "Fabian", "Lara", "Julian", "Sophia", "Leon",
        "Livia", "Matteo", "Emily", "Lena", "Samuel", "Alina", "Benjamin", "Sarah", "Simon", "Lisa",
        "Gabriel", "Julia", "Alexander", "Laura", "Finn", "Amelie", "Raphael", "Marie", "Jan", "Leonie"
    ];
    const lastNames = [
        "Müller", "Schmidt", "Meier", "Fischer", "Weber", "Huber", "Moser", "Schneider", "Bachmann", "Keller",
        "Zimmermann", "Frei", "Bucher", "Berger", "Steiner", "Schäfer", "Arnold", "Hofmann", "Koch", "Lang",
        "Baumann", "Schwarz", "Krüger", "Vogel", "Maurer", "Graf", "Brunner", "Wyss", "Zürcher", "Gerber",
        "Jäger", "Hermann", "Gasser", "Werner", "Stadelmann", "Frey", "Sutter", "Roth", "Locher", "Widmer"
    ];
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${randomFirstName}_${randomLastName}`;
}

const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

export { Chat, Message, validateChat, validateMessage, generateRandomName };

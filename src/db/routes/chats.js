import express from 'express';
import { Chat, Message, validateChat, validateMessage, generateRandomName } from '../models/chat.js';

const router = express.Router();

// Get all chats
router.get('/', async (req, res) => {
    const chats = await Chat.find().select('-messages');
    res.send(chats);
});

// Get a specific chat by ID
router.get('/:id', async (req, res) => {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).send(`Chat with ID ${req.params.id} not found`);
    res.send(chat);
});

// Create a new chat
router.post('/', async (req, res) => {
    const { error } = validateChat(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let chat = new Chat(req.body);
    chat = await chat.save();
    res.send(chat);
});

// Update a chat
router.put('/:id', async (req, res) => {
    const { error } = validateChat(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!chat) return res.status(404).send(`Chat with ID ${req.params.id} not found`);
    res.send(chat);
});

// Delete a chat
router.delete('/:id', async (req, res) => {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) return res.status(404).send(`Chat with ID ${req.params.id} not found`);
    res.send(chat);
});

// Create a new message in a chat
router.post('/:chatId/messages', async (req, res) => {
    const { error } = validateMessage(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).send(`Chat with ID ${req.params.chatId} not found`);

    // Generate random name for the message
    const randomName = generateRandomName();

    // Create message with generated name and content from request
    const messageData = {
        randomName,
        content: req.body.content
    };

    const message = new Message(messageData);
    chat.messages.push(message);
    await chat.save();
    res.send(message);
});

// Get all messages in a chat
router.get('/:chatId/messages', async (req, res) => {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).send(`Chat with ID ${req.params.chatId} not found`);
    res.send(chat.messages);
});

// Get a specific message by ID
router.get('/:chatId/messages/:messageId', async (req, res) => {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).send(`Chat with ID ${req.params.chatId} not found`);

    const message = chat.messages.id(req.params.messageId);
    if (!message) return res.status(404).send(`Message with ID ${req.params.messageId} not found`);
    res.send(message);
});

// Update a message
router.put('/:chatId/messages/:messageId', async (req, res) => {
    const { error } = validateMessage(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).send(`Chat with ID ${req.params.chatId} not found`);

    const message = chat.messages.id(req.params.messageId);
    if (!message) return res.status(404).send(`Message with ID ${req.params.messageId} not found`);

    message.set(req.body);
    await chat.save();
    res.send(message);
});

// Delete a message
router.delete('/:chatId/messages/:messageId', async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).send(`Chat with ID ${req.params.chatId} not found`);

        const message = chat.messages.id(req.params.messageId);
        if (!message) return res.status(404).send(`Message with ID ${req.params.messageId} not found`);

        // Use pull() instead of remove() as it's more reliable for subdocuments
        chat.messages.pull(req.params.messageId);
        await chat.save();
        
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

export { router as chatsRouter };

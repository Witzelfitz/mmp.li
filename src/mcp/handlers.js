import { Leaderboard } from '../db/models/leaderboard.js';
import { Note } from '../db/models/note.js';
import { Chat, Message, generateRandomName } from '../db/models/chat.js';

// =================== MCP Handler Functions ===================

export async function listResources() {
    return {
        resources: [
            {
                uriTemplate: 'mmp://database',
                name: 'Complete Database',
                description: 'All data from all collections (leaderboards, notes, chats)',
                mimeType: 'application/json'
            },
            {
                uriTemplate: 'mmp://leaderboards',
                name: 'All Leaderboards',
                description: 'Complete list of all leaderboards with entries',
                mimeType: 'application/json'
            },
            {
                uriTemplate: 'mmp://leaderboards/list',
                name: 'Leaderboard Summary',
                description: 'Summary of all leaderboards with entry counts and top scores',
                mimeType: 'application/json'
            },
            {
                uriTemplate: 'mmp://notes',
                name: 'All Notes',
                description: 'Complete list of all notes with entries',
                mimeType: 'application/json'
            },
            {
                uriTemplate: 'mmp://chats',
                name: 'All Chats',
                description: 'List of all chat rooms (without messages)',
                mimeType: 'application/json'
            }
        ]
    };
}

export async function getResource({ uri }) {
    switch (uri) {
        case 'mmp://database':
            try {
                const [leaderboards, notes, chats] = await Promise.all([
                    Leaderboard.find().lean(),
                    Note.find().lean(),
                    Chat.find().lean()
                ]);
                
                return {
                    contents: [{
                        type: 'json',
                        json: {
                            leaderboards,
                            notes,
                            chats,
                            metadata: {
                                timestamp: new Date().toISOString(),
                                counts: {
                                    leaderboards: leaderboards.length,
                                    notes: notes.length,
                                    chats: chats.length
                                }
                            }
                        }
                    }]
                };
            } catch (error) {
                throw new Error(`Failed to fetch complete database: ${error.message}`);
            }
            
        case 'mmp://leaderboards':
            try {
                const leaderboards = await Leaderboard.find().lean();
                return {
                    contents: [{
                        type: 'json',
                        json: leaderboards
                    }]
                };
            } catch (error) {
                throw new Error(`Failed to fetch leaderboards: ${error.message}`);
            }

        case 'mmp://leaderboards/list':
            try {
                const leaderboards = await Leaderboard.find().select('projectId entries.name entries.score').lean();
                return {
                    contents: [{
                        type: 'json',
                        json: leaderboards.map(lb => ({
                            projectId: lb.projectId,
                            entryCount: lb.entries?.length || 0,
                            topScore: lb.entries?.length > 0 ? Math.max(...lb.entries.map(e => e.score)) : 0
                        }))
                    }]
                };
            } catch (error) {
                throw new Error(`Failed to fetch leaderboard list: ${error.message}`);
            }

        case 'mmp://notes':
            try {
                const notes = await Note.find().lean();
                return {
                    contents: [{
                        type: 'json',
                        json: notes
                    }]
                };
            } catch (error) {
                throw new Error(`Failed to fetch notes: ${error.message}`);
            }

        case 'mmp://chats':
            try {
                const chats = await Chat.find().select('-messages').lean();
                return {
                    contents: [{
                        type: 'json',
                        json: chats
                    }]
                };
            } catch (error) {
                throw new Error(`Failed to fetch chats: ${error.message}`);
            }

        default:
            // Dynamic resources for specific items
            if (uri.startsWith('mmp://leaderboards/')) {
                const projectId = uri.replace('mmp://leaderboards/', '');
                try {
                    const leaderboard = await Leaderboard.findOne({ projectId }).lean();
                    if (!leaderboard) {
                        throw new Error(`Leaderboard ${projectId} not found`);
                    }
                    return {
                        contents: [{
                            type: 'json',
                            json: leaderboard
                        }]
                    };
                } catch (error) {
                    throw new Error(`Failed to fetch leaderboard ${projectId}: ${error.message}`);
                }
            }

            if (uri.startsWith('mmp://notes/')) {
                const noteId = uri.replace('mmp://notes/', '');
                try {
                    const note = await Note.findOne({ noteId }).lean();
                    if (!note) {
                        throw new Error(`Note ${noteId} not found`);
                    }
                    return {
                        contents: [{
                            type: 'json',
                            json: note
                        }]
                    };
                } catch (error) {
                    throw new Error(`Failed to fetch note ${noteId}: ${error.message}`);
                }
            }

            if (uri.startsWith('mmp://chats/') && uri.includes('/messages')) {
                const chatId = uri.replace('mmp://chats/', '').replace('/messages', '');
                try {
                    const chat = await Chat.findById(chatId).lean();
                    if (!chat) {
                        throw new Error(`Chat ${chatId} not found`);
                    }
                    return {
                        contents: [{
                            type: 'json',
                            json: chat.messages || []
                        }]
                    };
                } catch (error) {
                    throw new Error(`Failed to fetch messages for chat ${chatId}: ${error.message}`);
                }
            }

            throw new Error(`Unknown resource: ${uri}`);
    }
}

export async function listTools() {
    return {
        tools: [
            {
                name: 'create_leaderboard_entry',
                description: 'Add a new entry to a leaderboard (creates leaderboard if it doesn\'t exist)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'The project ID for the leaderboard'
                        },
                        playerName: {
                            type: 'string',
                            description: 'Name of the player (max 20 characters)'
                        },
                        score: {
                            type: 'number',
                            description: 'Score achieved by the player'
                        }
                    },
                    required: ['projectId', 'playerName', 'score']
                }
            },
            {
                name: 'delete_leaderboard',
                description: 'Delete an entire leaderboard by project ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'The project ID of the leaderboard to delete'
                        }
                    },
                    required: ['projectId']
                }
            },
            {
                name: 'create_note',
                description: 'Create a new note entry (creates note collection if it doesn\'t exist)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        noteId: {
                            type: 'string',
                            description: 'The note ID/collection identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Title of the note entry (max 20 characters)'
                        },
                        text: {
                            type: 'string',
                            description: 'Content of the note entry (max 200 characters)'
                        }
                    },
                    required: ['noteId', 'title', 'text']
                }
            },
            {
                name: 'update_note_entry',
                description: 'Update an existing note entry by entry ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        entryId: {
                            type: 'string',
                            description: 'The MongoDB ObjectId of the note entry to update'
                        },
                        title: {
                            type: 'string',
                            description: 'New title for the note entry (max 20 characters)'
                        },
                        text: {
                            type: 'string',
                            description: 'New content for the note entry (max 200 characters)'
                        }
                    },
                    required: ['entryId', 'title', 'text']
                }
            },
            {
                name: 'delete_note',
                description: 'Delete an entire note collection by note ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        noteId: {
                            type: 'string',
                            description: 'The note ID of the collection to delete'
                        }
                    },
                    required: ['noteId']
                }
            },
            {
                name: 'create_chat',
                description: 'Create a new chat room',
                inputSchema: {
                    type: 'object',
                    properties: {
                        roomId: {
                            type: 'string',
                            description: 'The room identifier for the chat'
                        }
                    },
                    required: ['roomId']
                }
            },
            {
                name: 'create_message',
                description: 'Send a new message to a chat room (generates random sender name)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chatId: {
                            type: 'string',
                            description: 'The MongoDB ObjectId of the chat room'
                        },
                        content: {
                            type: 'string',
                            description: 'The message content'
                        }
                    },
                    required: ['chatId', 'content']
                }
            },
            {
                name: 'delete_chat',
                description: 'Delete an entire chat room and all its messages',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chatId: {
                            type: 'string',
                            description: 'The MongoDB ObjectId of the chat room to delete'
                        }
                    },
                    required: ['chatId']
                }
            },
            {
                name: 'delete_message',
                description: 'Delete a specific message from a chat room',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chatId: {
                            type: 'string',
                            description: 'The MongoDB ObjectId of the chat room'
                        },
                        messageId: {
                            type: 'string',
                            description: 'The MongoDB ObjectId of the message to delete'
                        }
                    },
                    required: ['chatId', 'messageId']
                }
            },
            {
                name: 'list_leaderboards',
                description: 'List all available leaderboards with summary data.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'list_notes',
                description: 'List all available note collections with summary data.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'list_chats',
                description: 'List all available chat rooms.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'get_leaderboard',
                description: 'Get a specific leaderboard by project ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'The project ID of the leaderboard to retrieve'
                        }
                    },
                    required: ['projectId']
                }
            },
            {
                name: 'get_note',
                description: 'Get a specific note collection by note ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        noteId: {
                            type: 'string',
                            description: 'The note ID of the collection to retrieve'
                        }
                    },
                    required: ['noteId']
                }
            },
            {
                name: 'get_chat_messages',
                description: 'Get all messages from a specific chat room',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chatId: {
                            type: 'string',
                            description: 'The MongoDB ObjectId of the chat room'
                        }
                    },
                    required: ['chatId']
                }
            }
        ]
    };
}

export async function callTool({ name, arguments: args }) {

    switch (name) {
        case 'create_leaderboard_entry':
            try {
                const { projectId, playerName, score } = args;
                
                if (!projectId || !playerName || typeof score !== 'number') {
                    throw new Error('Missing required fields: projectId, playerName, score');
                }

                const cleanProjectId = projectId.replace(/\s+/g, '');
                const newEntry = { name: playerName, score };
                const options = { new: true, upsert: true, setDefaultsOnInsert: true };

                const leaderboard = await Leaderboard.findOneAndUpdate(
                    { projectId: cleanProjectId },
                    { $push: { entries: newEntry } },
                    options
                );

                return {
                    content: [{
                        type: 'text',
                        text: `Successfully added entry for ${playerName} with score ${score} to leaderboard ${cleanProjectId}`
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error creating leaderboard entry: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'delete_leaderboard':
            try {
                const { projectId } = args;
                
                if (!projectId) {
                    throw new Error('Missing required field: projectId');
                }

                const leaderboard = await Leaderboard.findOneAndDelete({ projectId });
                if (!leaderboard) {
                    throw new Error(`Leaderboard ${projectId} not found`);
                }

                return {
                    content: [{
                        type: 'text',
                        text: `Successfully deleted leaderboard ${projectId}`
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error deleting leaderboard: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'create_note':
            try {
                const { noteId, title, text } = args;
                
                if (!noteId || !title || !text) {
                    throw new Error('Missing required fields: noteId, title, text');
                }

                const cleanNoteId = noteId.replace(/\s+/g, '');
                const newEntry = { title, text };
                const options = { new: true, upsert: true, setDefaultsOnInsert: true };

                const note = await Note.findOneAndUpdate(
                    { noteId: cleanNoteId },
                    { $push: { entries: newEntry } },
                    options
                );

                return {
                    content: [{
                        type: 'text',
                        text: `Successfully created note entry in ${cleanNoteId}: "${title}"`
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error creating note: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'update_note_entry':
            try {
                const { entryId, title, text } = args;
                
                if (!entryId || !title || !text) {
                    throw new Error('Missing required fields: entryId, title, text');
                }

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
                    throw new Error(`Entry with ID ${entryId} not found`);
                }

                return {
                    content: [{
                        type: 'text',
                        text: `Successfully updated note entry ${entryId}: "${title}"`
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error updating note entry: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'delete_note':
            try {
                const { noteId } = args;
                
                if (!noteId) {
                    throw new Error('Missing required field: noteId');
                }

                const note = await Note.findOneAndDelete({ noteId });
                if (!note) {
                    throw new Error(`Note ${noteId} not found`);
                }

                return {
                    content: [{
                        type: 'text',
                        text: `Successfully deleted note ${noteId}`
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error deleting note: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'create_chat':
            try {
                const { roomId } = args;
                
                if (!roomId) {
                    throw new Error('Missing required field: roomId');
                }

                const chat = new Chat({ roomId, messages: [] });
                await chat.save();

                return {
                    content: [{
                        type: 'text',
                        text: `Successfully created chat room ${roomId} with ID ${chat._id}`
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error creating chat: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'create_message':
            try {
                const { chatId, content } = args;
                
                if (!chatId || !content) {
                    throw new Error('Missing required fields: chatId, content');
                }

                const chat = await Chat.findById(chatId);
                if (!chat) {
                    throw new Error(`Chat ${chatId} not found`);
                }

                const randomName = generateRandomName();
                const messageData = { randomName, content };
                const message = new Message(messageData);
                
                chat.messages.push(message);
                await chat.save();

                return {
                    content: [{
                        type: 'text',
                        text: `Successfully created message in chat ${chatId} from ${randomName}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error creating message: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'delete_chat':
            try {
                const { chatId } = args;
                
                if (!chatId) {
                    throw new Error('Missing required field: chatId');
                }

                const chat = await Chat.findByIdAndDelete(chatId);
                if (!chat) {
                    throw new Error(`Chat ${chatId} not found`);
                }

                return {
                    content: [{
                        type: 'text',
                        text: `Successfully deleted chat ${chatId}`
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error deleting chat: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'delete_message':
            try {
                const { chatId, messageId } = args;
                
                if (!chatId || !messageId) {
                    throw new Error('Missing required fields: chatId, messageId');
                }

                const chat = await Chat.findById(chatId);
                if (!chat) {
                    throw new Error(`Chat ${chatId} not found`);
                }

                const message = chat.messages.id(messageId);
                if (!message) {
                    throw new Error(`Message ${messageId} not found`);
                }

                chat.messages.pull(messageId);
                await chat.save();

                return {
                    content: [{
                        type: 'text',
                        text: `Successfully deleted message ${messageId} from chat ${chatId}`
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error deleting message: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'list_leaderboards':
            try {
                const leaderboards = await Leaderboard.find().select('projectId entries.score').lean();
                const summary = leaderboards.map(lb => ({
                    projectId: lb.projectId,
                    entryCount: lb.entries?.length || 0,
                    topScore: lb.entries?.length > 0 ? Math.max(...lb.entries.map(e => e.score)) : 0
                }));
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(summary, null, 2)
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error listing leaderboards: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'list_notes':
            try {
                const notes = await Note.find().select('noteId entries').lean();
                const summary = notes.map(n => ({
                    noteId: n.noteId,
                    entryCount: n.entries?.length || 0
                }));
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(summary, null, 2)
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error listing notes: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'list_chats':
            try {
                const chats = await Chat.find().select('-messages').lean();
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(chats, null, 2)
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error listing chats: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'get_leaderboard':
            try {
                const { projectId } = args;
                if (!projectId) {
                    throw new Error('Missing required field: projectId');
                }
                const leaderboard = await Leaderboard.findOne({ projectId }).lean();
                if (!leaderboard) {
                    throw new Error(`Leaderboard with projectId ${projectId} not found.`);
                }
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(leaderboard, null, 2)
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error getting leaderboard: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'get_note':
            try {
                const { noteId } = args;
                if (!noteId) {
                    throw new Error('Missing required field: noteId');
                }
                const note = await Note.findOne({ noteId }).lean();
                if (!note) {
                    throw new Error(`Note with noteId ${noteId} not found.`);
                }
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(note, null, 2)
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error getting note: ${error.message}`
                    }],
                    isError: true
                };
            }

        case 'get_chat_messages':
            try {
                const { chatId } = args;
                if (!chatId) {
                    throw new Error('Missing required field: chatId');
                }
                const chat = await Chat.findById(chatId).lean();
                if (!chat) {
                    throw new Error(`Chat ${chatId} not found`);
                }
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(chat.messages || [], null, 2)
                    }],
                    isError: false
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error getting chat messages: ${error.message}`
                    }],
                    isError: true
                };
            }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
} 
import { connectDB } from './db/index.js';
import express from 'express';
import { leaderboardRouter } from './db/routes/leaderboards.js';
import { notesRouter } from './db/routes/notes.js';
import { chatsRouter } from './db/routes/chats.js';
import cors from 'cors';
import config from './config.js';
import { listResources, getResource, listTools, callTool } from './mcp/handlers.js';

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Configure Express app
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://mmp.li'],
    credentials: true,
    exposedHeaders: ['X-MCP-Session-Id']
}));
app.use(express.static('public'));


app.use('/leaderboards', leaderboardRouter);
app.use('/notes', notesRouter);
app.use('/chats', chatsRouter);

// =================== MCP Server Setup ===================

// MCP HTTP endpoint - handles all MCP protocol requests
app.post('/mcp', async (req, res) => {
    try {
        const message = req.body;
        
        console.log(`[MCP] Received request: ${message.method}`);
        
        let response;
        
        // Route MCP requests to appropriate handlers
        switch (message.method) {
            case 'initialize':
                response = {
                    jsonrpc: '2.0',
                    id: message.id,
                    result: {
                        protocolVersion: '2024-11-05',
                        capabilities: {
                            resources: {},
                            tools: {}
                        },
                        serverInfo: {
                            name: 'mmp.li',
                            version: '1.0.0'
                        }
                    }
                };
                break;
                
            case 'resources/list':
                const resourcesResponse = await listResources();
                response = {
                    jsonrpc: '2.0',
                    id: message.id,
                    result: resourcesResponse
                };
                break;
                
            case 'resources/read':
                const readResponse = await getResource(message.params);
                response = {
                    jsonrpc: '2.0',
                    id: message.id,
                    result: readResponse
                };
                break;
                
            case 'tools/list':
                const toolsResponse = await listTools();
                response = {
                    jsonrpc: '2.0',
                    id: message.id,
                    result: toolsResponse
                };
                break;
                
            case 'tools/call':
                const callResponse = await callTool(message.params);
                response = {
                    jsonrpc: '2.0',
                    id: message.id,
                    result: callResponse
                };
                break;
                
            default:
                response = {
                    jsonrpc: '2.0',
                    id: message.id,
                    error: {
                        code: -32601,
                        message: `Method not found: ${message.method}`
                    }
                };
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
        
    } catch (error) {
        console.error('[MCP] Error handling request:', error);
        
        const errorResponse = {
            jsonrpc: '2.0',
            id: req.body?.id || null,
            error: {
                code: -32603,
                message: 'Internal error',
                data: error.message
            }
        };
        
        res.status(500).json(errorResponse);
    }
});

// MCP capabilities endpoint (GET request for discovery)
app.get('/mcp', (req, res) => {
    res.json({
        name: 'mmp.li MCP Server',
        version: '1.0.0',
        description: 'MCP server for mmp.li API providing access to leaderboards, notes, and chats',
        capabilities: {
            resources: {
                'mmp://leaderboards': 'All leaderboards data',
                'mmp://notes': 'All notes data', 
                'mmp://chats': 'All chat rooms'
            },
            tools: {
                'create_leaderboard_entry': 'Add entry to leaderboard',
                'create_note': 'Create note entry',
                'create_chat': 'Create chat room',
                'create_message': 'Send message to chat',
                'delete_leaderboard': 'Delete leaderboard',
                'delete_note': 'Delete note',
                'delete_chat': 'Delete chat room',
                'delete_message': 'Delete message'
            }
        },
        endpoints: {
            mcp: '/mcp',
            resources: 'POST /mcp with method: resources/list or resources/read',
            tools: 'POST /mcp with method: tools/list or tools/call'
        }
    });
});

// Start Express app
const port = config.Port;
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

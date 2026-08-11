import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from './config.js';
import { connectDB } from './db/index.js';
import { chatsRouter } from './db/routes/chats.js';
import { leaderboardRouter } from './db/routes/leaderboards.js';
import { notesRouter } from './db/routes/notes.js';
import { callTool, getResource, listResources, listTools } from './mcp/handlers.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');
const currentFile = fileURLToPath(import.meta.url);
const publicDirectory = path.join(path.dirname(currentFile), 'public');

export function createApp() {
    const app = express();

    app.disable('x-powered-by');
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: false,
        exposedHeaders: ['X-MCP-Session-Id']
    }));
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'no-referrer');
        next();
    });
    app.use(express.json({ limit: '32kb' }));

    app.get('/health', (req, res) => {
        const databaseConnected = mongoose.connection.readyState === 1;
        res.status(databaseConnected ? 200 : 503).json({
            status: databaseConnected ? 'ok' : 'degraded',
            version,
            uptime: Math.round(process.uptime()),
            database: databaseConnected ? 'connected' : 'disconnected'
        });
    });

    app.use(express.static(publicDirectory));
    app.use('/leaderboards', leaderboardRouter);
    app.use('/notes', notesRouter);
    app.use('/chats', chatsRouter);

    app.post('/mcp', async (req, res) => {
        const message = req.body;

        if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
            return res.status(400).json({
                jsonrpc: '2.0',
                id: message?.id ?? null,
                error: { code: -32600, message: 'Invalid Request' }
            });
        }

        try {
            let response;

            switch (message.method) {
                case 'initialize':
                    response = {
                        jsonrpc: '2.0',
                        id: message.id,
                        result: {
                            protocolVersion: '2024-11-05',
                            capabilities: { resources: {}, tools: {} },
                            serverInfo: { name: 'mmp.li', version }
                        }
                    };
                    break;
                case 'resources/list':
                    response = {
                        jsonrpc: '2.0',
                        id: message.id,
                        result: await listResources()
                    };
                    break;
                case 'resources/read':
                    response = {
                        jsonrpc: '2.0',
                        id: message.id,
                        result: await getResource(message.params)
                    };
                    break;
                case 'tools/list':
                    response = {
                        jsonrpc: '2.0',
                        id: message.id,
                        result: await listTools()
                    };
                    break;
                case 'tools/call':
                    response = {
                        jsonrpc: '2.0',
                        id: message.id,
                        result: await callTool(message.params)
                    };
                    break;
                default:
                    response = {
                        jsonrpc: '2.0',
                        id: message.id,
                        error: { code: -32601, message: `Method not found: ${message.method}` }
                    };
            }

            return res.json(response);
        } catch (error) {
            console.error(`[MCP ${message.method}]`, error);
            return res.status(500).json({
                jsonrpc: '2.0',
                id: message.id ?? null,
                error: { code: -32603, message: 'Internal error' }
            });
        }
    });

    app.get('/mcp', (req, res) => {
        res.json({
            name: 'mmp.li MCP Server',
            version,
            description: 'MCP server for mmp.li API providing access to leaderboards, notes, and chats',
            capabilities: {
                resources: {
                    'mmp://leaderboards': 'All leaderboards data',
                    'mmp://notes': 'All notes data',
                    'mmp://chats': 'All chat rooms'
                },
                tools: {
                    create_leaderboard_entry: 'Add entry to leaderboard',
                    create_note: 'Create note entry',
                    create_chat: 'Create chat room',
                    create_message: 'Send message to chat',
                    delete_leaderboard: 'Delete leaderboard',
                    delete_note: 'Delete note',
                    delete_chat: 'Delete chat room',
                    delete_message: 'Delete message'
                }
            },
            endpoints: {
                mcp: '/mcp',
                resources: 'POST /mcp with method: resources/list or resources/read',
                tools: 'POST /mcp with method: tools/list or tools/call'
            }
        });
    });

    app.use((req, res) => {
        res.status(404).json({ error: 'Not found' });
    });

    app.use((error, req, res, next) => {
        console.error(`[${req.method} ${req.originalUrl}]`, error);
        if (res.headersSent) return next(error);
        const status = Number.isInteger(error.status) && error.status < 500 ? error.status : 500;
        return res.status(status).json({
            error: status < 500 ? 'Invalid request' : 'Internal server error'
        });
    });

    return app;
}

export async function startServer() {
    await connectDB();
    const app = createApp();
    return app.listen(config.port, () => {
        console.log(`Server started at http://localhost:${config.port}`);
    });
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
    startServer().catch((error) => {
        console.error('Server startup failed:', error.message);
        process.exitCode = 1;
    });
}

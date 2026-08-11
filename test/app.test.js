import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../src/index.js';

async function withServer(run) {
    const server = createApp().listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();

    try {
        await run(`http://127.0.0.1:${port}`);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
}

test('serves the committed frontend from src/public', async () => {
    await withServer(async (baseUrl) => {
        const home = await fetch(`${baseUrl}/`);
        assert.equal(home.status, 200);
        const homeHtml = await home.text();
        assert.match(homeHtml, /mmp\.li API-Dokumentation/);
        assert.match(homeHtml, /\/notes\/entry\/:entryId/);

        const script = await fetch(`${baseUrl}/js/main.js`);
        assert.equal(script.status, 200);
        const scriptSource = await script.text();
        assert.match(scriptSource, /window\.location\.origin/);
        assert.match(scriptSource, /\/notes\/entry\/\$\{entryId\}/);
        assert.match(scriptSource, /\/notes\/\$\{noteId\}/);
    });
});

test('reports a degraded health state without a database connection', async () => {
    await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/health`);
        assert.equal(response.status, 503);
        const body = await response.json();
        assert.equal(body.status, 'degraded');
        assert.equal(body.version, '1.1.0');
        assert.equal(body.database, 'disconnected');
        assert.equal(typeof body.uptime, 'number');
    });
});

test('returns JSON for unknown routes and invalid MCP requests', async () => {
    await withServer(async (baseUrl) => {
        const missing = await fetch(`${baseUrl}/missing`);
        assert.equal(missing.status, 404);
        assert.deepEqual(await missing.json(), { error: 'Not found' });

        const invalidMcp = await fetch(`${baseUrl}/mcp`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{}'
        });
        assert.equal(invalidMcp.status, 400);
        assert.equal((await invalidMcp.json()).error.code, -32600);
    });
});

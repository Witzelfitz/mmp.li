const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const endpoints = ['/', '/health', '/leaderboards', '/notes', '/chats', '/mcp'];

let failed = false;

for (const endpoint of endpoints) {
    try {
        const startedAt = Date.now();
        const response = await fetch(`${baseUrl}${endpoint}`, {
            signal: AbortSignal.timeout(15000)
        });
        const contentType = response.headers.get('content-type') || '';
        const healthy = response.ok && (
            endpoint === '/' ? contentType.includes('text/html') : contentType.includes('application/json')
        );

        console.log(`${healthy ? '✓' : '✗'} ${endpoint} ${response.status} ${Date.now() - startedAt}ms`);
        failed ||= !healthy;
    } catch (error) {
        console.error(`✗ ${endpoint} ${error.message}`);
        failed = true;
    }
}

if (failed) process.exitCode = 1;

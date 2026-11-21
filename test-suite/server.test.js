'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createApp } = require('../server.js');

function startTestServer() {
    return new Promise((resolve) => {
        const app = createApp();
        const server = http.createServer(app);
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
        });
    });
}

test('server serves index.html, player, modules, and blocks sensitive files', async (t) => {
    const { server, baseUrl } = await startTestServer();
    t.after(() => new Promise((resolve) => server.close(resolve)));

    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    const rootHtml = await rootRes.text();
    assert.ok(rootHtml.includes('יוצר מבחן אינטראקטיבי'));

    const playerRes = await fetch(`${baseUrl}/quiz_player.html`);
    assert.equal(playerRes.status, 200);

    const mjsRes = await fetch(`${baseUrl}/vendor/pdfjs/pdf.min.mjs`);
    assert.equal(mjsRes.status, 200);
    assert.match(mjsRes.headers.get('content-type') || '', /javascript/);

    const manifestRes = await fetch(`${baseUrl}/manifest.webmanifest`);
    assert.equal(manifestRes.status, 200);
    assert.match(manifestRes.headers.get('content-type') || '', /manifest\+json/);

    const serverJsRes = await fetch(`${baseUrl}/server.js`);
    assert.equal(serverJsRes.status, 404);

    const pkgRes = await fetch(`${baseUrl}/package.json`);
    assert.equal(pkgRes.status, 404);
});

'use strict';

const express = require('express');
const path = require('path');

const BLOCKED_FILES = new Set([
    '/server.js',
    '/package.json',
    '/package-lock.json',
    '/playwright.config.js',
    '/pytest.ini'
]);

function createApp() {
    const app = express();
    const rootDir = __dirname;

    app.use((req, res, next) => {
        if (BLOCKED_FILES.has(req.path)) {
            return res.status(404).send('Not found');
        }
        next();
    });

    app.use(
        express.static(rootDir, {
            dotfiles: 'ignore',
            index: 'index.html',
            setHeaders(res, filePath) {
                if (filePath.endsWith('.mjs')) {
                    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                } else if (filePath.endsWith('.webmanifest')) {
                    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
                }
            }
        })
    );

    app.get('/', (req, res) => {
        res.sendFile(path.join(rootDir, 'index.html'));
    });

    return app;
}

if (require.main === module) {
    const port = Number(process.env.PORT) || 3000;
    const host = '0.0.0.0';
    const app = createApp();

    app.listen(port, host, () => {
        console.log(`Interactive Hebrew Quiz Generator server running at http://${host}:${port}`);
    });
}

module.exports = { createApp };

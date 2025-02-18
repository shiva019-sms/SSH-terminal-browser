const express = require('express');
const WebSocket = require('ws');
const { Client } = require('ssh2');

const app = express();
const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const query = new URLSearchParams(req.url.split('?')[1]);
    const username = query.get('username');
    const password = query.get('password'); // Get password from URL
    const host = query.get('host');
    const port = query.get('port') || 22;

    const conn = new Client();

    conn.on('ready', () => {
        ws.send('SSH Connection Established\r\n');

        conn.shell((err, stream) => {
            if (err) {
                ws.send(`Error: ${err.message}\r\n`);
                return;
            }

            ws.on('message', (data) => {
                stream.write(data);
            });

            stream.on('data', (data) => {
                ws.send(data.toString('utf-8'));
            });

            stream.on('close', () => {
                ws.close();
                conn.end();
            });
        });
    });

    conn.on('error', (err) => {
        ws.send(`Error: ${err.message}\r\n`);
        ws.close();
    });

    conn.connect({
        host: host,
        port: port,
        username: username,
        password: password, // Use password for authentication
    });

    ws.on('close', () => {
        conn.end();
    });
});

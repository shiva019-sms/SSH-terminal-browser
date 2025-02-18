wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        let credentials;
        try {
            credentials = JSON.parse(message);
        } catch (error) {
            ws.send('Error: Invalid authentication format\r\n');
            ws.close();
            return;
        }

        const { username, password, host, port } = credentials;

        if (!username || !password || !host) {
            ws.send('Error: Missing required fields\r\n');
            ws.close();
            return;
        }

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
            password: password,
        });

        ws.on('close', () => {
            conn.end();
        });
    });
});

const term = new Terminal();
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
fitAddon.fit();

async function connectSSH() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const host = document.getElementById('host').value;
    const port = document.getElementById('port').value || 22;

    if (!username || !password || !host) {
        alert('Please fill in all fields.');
        return;
    }

    term.clear();

    const socket = new WebSocket(`ws://localhost:3000/ssh?username=${username}&password=${password}&host=${host}&port=${port}`);

    socket.onopen = () => {
        term.write('Connecting to SSH...\r\n');
        socket.send(password + '\r\n');

        term.onData((data) => {
            socket.send(data);
        });

        socket.onmessage = (event) => {
            term.write(event.data);
        };
    };

    socket.onerror = (error) => {
        term.write(`Error: ${error.message}\r\n`);
    };

    socket.onclose = () => {
        term.write('SSH connection closed.\r\n');
    };
}
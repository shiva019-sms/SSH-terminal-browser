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

    const socket = new WebSocket(`wss://ssh-terminal-browser.onrender.com`);


    socket.onopen = () => {
        term.write('Connected to WebSocket server...\r\n');
        const authData = JSON.stringify({ username, password, host, port });
        socket.send(authData); // Send JSON object instead of just password
    };

    socket.onmessage = (event) => {
        term.write(event.data);
    };

    socket.onerror = (event) => {
        console.error("WebSocket Error:", event);
        term.write("WebSocket error occurred. Check console for details.\r\n");
    };

    socket.onclose = () => {
        term.write('SSH connection closed.\r\n');
    };

    term.onData((data) => {
        socket.send(data);
    });
}

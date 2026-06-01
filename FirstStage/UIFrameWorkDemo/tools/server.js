const {WebSocketServer} = require('ws');

const port = 8080;
const wss = new WebSocketServer({port});

wss.on('connection', (socket) => {
	console.log('Client connected');

	socket.on('message', (message) => {
		const text = message.toString();
		console.log('收到客户端消息:', text);

		let replyContent = text;
		try {
			const packet = JSON.parse(text);
			if (packet.cmd === 'heart') {
				replyContent = packet.data ?? '';
			} else {
				replyContent = packet.data ?? text;
			}
		} catch {
			replyContent = text;
		}

		socket.send(`已收到：${replyContent}`);
	});

	socket.on('close', () => {
		console.log('Client disconnected');
	});

	socket.on('error', (error) => {
		console.error('WebSocket server error:', error);
	});
});

console.log(`WebSocket server is running at ws://localhost:${port}`);

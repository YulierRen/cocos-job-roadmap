const {WebSocketServer} = require('ws');

const port = 8080;
const wss = new WebSocketServer({port});

function buildReplyPacket(packet) {
    const baseReply = {
        cmd: packet.cmd,
        data: packet.data,
        seq: packet.seq,
        code: 0
    };

    switch (packet.cmd) {
        case 'ping':
            return {
                ...baseReply,
                cmd: 'pong',
                data: {
                    ts: Date.now()
                }
            };
        case 'echo':
            return {
                ...baseReply,
                cmd: 'echo',
                data: {
                    msg: 'echo response'
                }
            };
        default:
            return {
                ...baseReply,
                cmd: `${packet.cmd}_ack`
            };
    }
}

wss.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (message) => {
        const text = message.toString();
        console.log('收到客户端消息:', text);

        let replyPacket;
        try {
            const packet = JSON.parse(text);
            if (!packet || typeof packet.cmd !== 'string') {
                replyPacket = {
                    cmd: 'error',
                    data: {
                        reason: 'Invalid packet: cmd is required'
                    },
                    seq: typeof packet?.seq === 'number' ? packet.seq : undefined,
                    code: 400
                };
            } else {
                replyPacket = buildReplyPacket(packet);
            }
        } catch (error) {
            replyPacket = {
                cmd: 'error',
                data: {
                    reason: 'Invalid JSON',
                    raw: text
                },
                code: 400
            };
        }

        const replyContent = JSON.stringify(replyPacket);
        socket.send(replyContent);
        console.log('回复客户端消息:', replyContent);
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });
});

console.log(`WebSocket server is running at ws://localhost:${port}`);

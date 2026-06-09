import {_decorator, Component} from 'cc';
import {FSM} from '../FSM';
import {Connecting} from './NetState/Connecting';
import {HasConnected} from './NetState/HasConnected';
import {ReConnect} from './NetState/ReConnect';
import {INet, NetMgr, NetPacket} from './NetMgr';
import {LogMgr} from '../LogMgr';
import {NetDispatcher} from './NetDispatcher';

const {ccclass, property} = _decorator;

export class Client extends Component implements INet {
    public netKey = 'default';

    private fsm: FSM<Client> = null;
    private ws: WebSocket = null;
    private heartbeatTimer: number | null = null;
    private isManualClose = false;
    private pingInterval = 5000;
    private pingTimeout = 10000;
    private requestTimeout = 5000;
    private lastPongTime = 0;
    private lastConnectUrl = '';
    private seqSeed = 0;
    private pendingRequests = new Map<
        number,
        {
            resolve: (packet: NetPacket) => void;
            reject: (reason?: any) => void;
            timer: number;
        }
    >();

    private dispatcher: NetDispatcher = new NetDispatcher();

    protected onLoad(): void {
        this.initFSM();
        if (!this.netKey) this.netKey = 'default';

        this.onMessage('pong', () => {
            this.receivePong();
        });
    }

    protected onDestroy(): void {
        NetMgr.Instance?.unregisterNet(this.getRegistryKey());
        this.stopHeartbeat();
        this.close();
    }

    update(dt: number): void {
        this.fsm?.update(dt);
    }

    connect(url: string): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            LogMgr.Info('connect skipped: WebSocket is already open or connecting');
            return;
        }

        this.lastConnectUrl = url;
        this.changeState('Connecting', url);
    }

    close(code = 1000, reason = 'manual close'): void {
        this.rejectAllPendingRequests(`socket closed: ${reason}`);
        if (!this.ws) {
            return;
        }

        this.isManualClose = true;
        this.stopHeartbeat();
        LogMgr.Info('Closing WebSocket connection');
        this.ws.close(code, reason);

        this.ws = null;
    }

    send(msg: NetPacket): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            LogMgr.Warn('WebSocket is not open, send canceled');
            return;
        }

        const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
        console.log('Sending message:', payload);
        this.ws.send(payload);
        LogMgr.Info('Sending message:', msg);
    }

    onMessage(cmd: string, cb: (msg: any) => void): void {
        this.dispatcher.on(cmd, cb);
    }

    request(cmd: string, data?: any): Promise<NetPacket> {
        return new Promise((resolve, reject) => {
            if (!cmd) {
                reject(new Error('request canceled: cmd is empty'));
                return;
            }

            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                reject(new Error('request canceled: WebSocket is not open'));
                return;
            }

            const seq = this.nextSeq();
            const timer = window.setTimeout(() => {
                const pending = this.pendingRequests.get(seq);
                if (!pending) {
                    return;
                }

                this.pendingRequests.delete(seq);
                pending.reject(new Error(`request timeout: cmd=${cmd}, seq=${seq}`));
            }, this.requestTimeout);

            this.pendingRequests.set(seq, {
                resolve,
                reject,
                timer
            });

            this.send({cmd, data, seq});
        });
    }

    public waitForOpen(timeout = 5000): Promise<void> {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        if (!this.ws || this.ws.readyState !== WebSocket.CONNECTING) {
            return Promise.reject(new Error('waitForOpen canceled: WebSocket is not connecting'));
        }

        return new Promise((resolve, reject) => {
            const ws = this.ws;
            const timer = window.setTimeout(() => {
                cleanup();
                reject(new Error('waitForOpen timeout: WebSocket did not open in time'));
            }, timeout);

            const handleOpen = () => {
                cleanup();
                resolve();
            };

            const handleClose = () => {
                cleanup();
                reject(new Error('waitForOpen failed: WebSocket closed before open'));
            };

            const handleError = () => {
                cleanup();
                reject(new Error('waitForOpen failed: WebSocket error before open'));
            };

            const cleanup = () => {
                window.clearTimeout(timer);
                ws.removeEventListener('open', handleOpen);
                ws.removeEventListener('close', handleClose);
                ws.removeEventListener('error', handleError);
            };

            ws.addEventListener('open', handleOpen);
            ws.addEventListener('close', handleClose);
            ws.addEventListener('error', handleError);
        });
    }

    public openSocket(url: string): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            LogMgr.Warn('WebSocket is already connected or connecting');
            return;
        }

        this.lastConnectUrl = url;
        this.isManualClose = false;
        this.ws = new WebSocket(url);
        this.ws.onopen = () => {
            LogMgr.Info('WebSocket connection opened');
            this.lastPongTime = Date.now();
            this.changeState('HasConnected');
        };
        this.ws.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        this.ws.onclose = (event) => {
            LogMgr.Warn(`WebSocket connection closed: ${event.code} - ${event.reason}`);
            this.stopHeartbeat();
            this.rejectAllPendingRequests(`socket closed: ${event.code} ${event.reason}`);
            this.ws = null;
            if (!this.isManualClose) {
                this.changeState('ReConnect', this.lastConnectUrl);
            }
        };
        this.ws.onerror = (error) => {
            LogMgr.Error('WebSocket error:', error);
        };
    }

    public startHeartbeat(): void {
        this.stopHeartbeat();
        this.lastPongTime = Date.now();
        this.heartbeatTimer = window.setInterval(() => {
            this.send({cmd: 'ping', data: 'isConnecting', seq: Date.now()});
            console.log('Sent ping to server');
        }, this.pingInterval);
    }

    public receivePong(): void {
        console.log('Received pong from server');
        this.lastPongTime = Date.now();
    }

    public stopHeartbeat(): void {
        if (this.heartbeatTimer == null) {
            return;
        }

        window.clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
    }

    public checkHeartbeatTimeout(): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        const now = Date.now();
        if (this.lastPongTime && now - this.lastPongTime > this.pingTimeout) {
            LogMgr.Warn('WebSocket heartbeat timeout, closing connection');
            this.close(1000, 'heartbeat timeout');
        }
    }

    public getLastConnectUrl(): string {
        return this.lastConnectUrl;
    }

    public changeState(stateName: string, args?: any): void {
        this.fsm?.change(stateName, args);
        LogMgr.Info(`Client[${this.getRegistryKey()}] state => ${this.fsm?.getstateName() ?? 'None'}`);
    }

    private initFSM(): void {
        this.fsm = new FSM<Client>(this);
        this.fsm.add(new Connecting());
        this.fsm.add(new ReConnect());
        this.fsm.add(new HasConnected());
    }

    private getRegistryKey(): string {
        return this.netKey || this.node.uuid;
    }

    private nextSeq(): number {
        this.seqSeed = (this.seqSeed + 1) % 1000000;
        return Date.now() * 1000000 + this.seqSeed;
    }

    private rejectAllPendingRequests(reason: string): void {
        if (this.pendingRequests.size === 0) {
            return;
        }

        const error = new Error(reason);
        this.pendingRequests.forEach((pending) => {
            window.clearTimeout(pending.timer);
            pending.reject(error);
        });
        this.pendingRequests.clear();
    }

    private handleMessage(rawMessage: string): void {
        let packet: NetPacket | null = null;

        try {
            packet = JSON.parse(rawMessage) as NetPacket;
        } catch {
            LogMgr.Warn('Received non-JSON message:', rawMessage);
            return;
        }

        if (!packet || typeof packet.cmd !== 'string') {
            LogMgr.Warn('Invalid NetPacket:', rawMessage);
            return;
        }

        if (typeof packet.seq === 'number') {
            const pending = this.pendingRequests.get(packet.seq);
            if (pending) {
                window.clearTimeout(pending.timer);
                this.pendingRequests.delete(packet.seq);
                pending.resolve(packet);
            }
        }

        LogMgr.Log('Received message:', packet);
        this.dispatcher.emit(packet.cmd, packet);
    }
}

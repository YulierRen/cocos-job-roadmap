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
    private lastPongTime = 0;
    private lastConnectUrl = '';
    private messageHandlers = new Set<(msg: any) => void>();

    private dispatcher: NetDispatcher = new NetDispatcher();

    protected onLoad(): void {
        this.initFSM();
        if (!this.netKey) this.netKey = 'default';
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
        this.lastConnectUrl = url;
        this.changeState('Connecting', url);
    }

    close(code = 1000, reason = 'manual close'): void {
        if (!this.ws) {
            return;
        }

        this.isManualClose = true;
        this.stopHeartbeat();
        LogMgr.Info('Closing WebSocket connection');
        this.ws.close(code, reason);
        this.ws = null;
    }

    send(msg: unknown): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            LogMgr.Warn('WebSocket is not open, send canceled');
            return;
        }

        const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
        this.ws.send(payload);
        LogMgr.Info('Sending message:', msg);
    }

    onMessage(cmd: string, cb: (msg: any) => void): void {
        this.dispatcher.on(cmd, cb);
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
            this.send({cmd: 'heart', data: 'isConnecting'});
        }, this.pingInterval);
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

    private handleMessage(rawMessage: string): void {
        let packet: any = rawMessage;
        try {
            packet = JSON.parse(rawMessage) as NetPacket;
        } catch {
            // Non-JSON payloads are allowed.
        }
        LogMgr.Log('Received message:', rawMessage);
        this.dispatcher.emit(packet.cmd, packet);
    }
}

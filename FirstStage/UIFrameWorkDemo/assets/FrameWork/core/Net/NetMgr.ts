import {Component} from 'cc';
import {LogMgr} from '../LogMgr';

export enum NetUrl {
    url = 'ws://localhost:8080'
}

export interface NetPacket {
    cmd: string;
    data?: any;
    seq?: number;
    code?: number;
}

export interface INet {
    connect(url: string): void;
    close(): void;
    send(msg: NetPacket): void;
    onMessage(cmd: string, cb: (msg: any) => void): void;
    request(cmd: string, data?: any): Promise<NetPacket>;
}
export class NetMgr extends Component {
    Init() {}
    public static Instance: NetMgr = null;

    private readonly nets = new Map<string, INet>();

    protected onLoad(): void {
        if (NetMgr.Instance == null) {
            NetMgr.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    protected onDestroy(): void {
        if (NetMgr.Instance === this) {
            this.nets.clear();
            NetMgr.Instance = null;
        }
    }

    registerNet(key: string, net: INet): void {
        if (!key) {
            LogMgr.Warn('registerNet canceled: key is empty');
            return;
        }

        this.nets.set(key, net);

        LogMgr.Info(`Registered net: ${key}`);
    }

    unregisterNet(key: string): void {
        if (!key) {
            return;
        }

        if (this.nets.delete(key)) {
            LogMgr.Info(`Unregistered net: ${key}`);
        }
    }

    getNet(key: string): INet | undefined {
        return this.nets.get(key);
    }

    connect(key: string, url: string): void {
        console.log(this.nets);
        const net = this.nets.get(key);
        if (!net) {
            LogMgr.Warn(`connect canceled: net not found for key ${key}`);
            return;
        }

        net.connect(url);
    }

    send(key: string, msg: NetPacket): void {
        const net = this.nets.get(key);
        if (!net) {
            LogMgr.Warn(`send canceled: net not found for key ${key}`);
            return;
        }

        net.send(msg);
    }

    close(key: string): void {
        const net = this.nets.get(key);
        if (!net) {
            LogMgr.Warn(`close canceled: net not found for key ${key}`);
            return;
        }

        net.close();
    }

    onMessage(key: string, cmd: string, cb: (msg: any) => void): void {
        const net = this.nets.get(key);
        if (!net) {
            LogMgr.Warn(`onMessage canceled: net not found for key ${key}`);
            return;
        }

        net.onMessage(cmd, cb);
    }

    request(key: string, cmd: string, data?: any): Promise<NetPacket> {
        const net = this.nets.get(key);
        if (!net) {
            LogMgr.Warn(`request canceled: net not found for key ${key}`);
            return Promise.reject(new Error(`net not found for key ${key}`));
        }
        return net.request(cmd, data);
    }
}

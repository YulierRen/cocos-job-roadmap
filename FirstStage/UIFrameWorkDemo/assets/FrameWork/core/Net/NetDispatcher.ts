import {_decorator, Component, Node} from 'cc';
import {NetPacket} from './NetMgr';

type NetHandler = (packet: NetPacket) => void;

export class NetDispatcher {
    private dispatcher: Map<string, Set<NetHandler>> = new Map();

    on(cmd: string, handler: NetHandler) {
        let handlers = this.dispatcher.get(cmd);
        if (!handlers) {
            handlers = new Set<NetHandler>();
            this.dispatcher.set(cmd, handlers);
        }

        handlers.add(handler);
    }
    off(cmd: string, handler: NetHandler) {
        const handlers = this.dispatcher.get(cmd);
        if (!handlers) {
            return;
        }

        handlers.delete(handler);
    }
    emit(cmd: string, packet: NetPacket) {
        const handlers = this.dispatcher.get(cmd);
        if (!handlers) {
            return;
        }

        handlers.forEach((func) => func(packet));
    }
    clear(cmd?: string) {
        if (cmd == null) {
            this.dispatcher.clear();
            return;
        }

        const handlers = this.dispatcher.get(cmd);
        if (!handlers) {
            return;
        }

        handlers.clear();
    }
}

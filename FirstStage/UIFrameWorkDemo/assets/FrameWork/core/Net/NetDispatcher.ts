import {_decorator, Component, Node} from 'cc';

export class NetDispatcher {
    private dispatcher: Map<string, Set<Function>> = new Map();

    on(cmd: string, handler: Function) {
        this.dispatcher.get(cmd).add(handler);
    }
    off(cmd, handler) {
        this.dispatcher.get(cmd).delete(handler);
    }
    emit(cmd, packet) {
        this.dispatcher.get(cmd).forEach((func) => {
            func.call(func, packet);
        });
    }
    clear(cmd?) {
        this.dispatcher.get(cmd).clear();
    }
}

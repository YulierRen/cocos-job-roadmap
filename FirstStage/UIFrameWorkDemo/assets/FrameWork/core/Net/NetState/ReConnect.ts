import {IState} from '../../FSM';
import {Client} from '../Client';
import {LogMgr} from '../../LogMgr';

export class ReConnect implements IState<Client> {
    name = 'ReConnect';
    private retryDelay = 2000;
    private retryTimer: number | null = null;

    onEnter(owner: Client, args?: any): void {
        LogMgr.Warn(`State Enter: ReConnect, retry in ${this.retryDelay} ms`);
        this.retryTimer = window.setTimeout(() => {
            owner.changeState('Connecting', typeof args === 'string' ? args : owner.getLastConnectUrl());
        }, this.retryDelay);
    }

    onUpdate(owner: Client, dt: number): void {
        // ReConnect uses timer scheduling; no per-frame logic.
    }

    onExit(owner: Client): void {
        LogMgr.Info('State Exit: ReConnect');
        if (this.retryTimer != null) {
            window.clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
    }
}

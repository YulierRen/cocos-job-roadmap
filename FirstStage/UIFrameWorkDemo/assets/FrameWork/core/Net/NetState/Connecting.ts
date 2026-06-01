import {IState} from '../../FSM';
import {NetUrl} from '../NetMgr';
import {Client} from '../Client';
import {LogMgr} from '../../LogMgr';

export class Connecting implements IState<Client> {
    name = 'Connecting';

    onEnter(owner: Client, args?: any): void {
        LogMgr.Info('State Enter: Connecting');
        owner.openSocket(typeof args === 'string' ? args : NetUrl.url);
    }

    onUpdate(owner: Client, dt: number): void {
        // Connecting does not need per-frame logic.
    }

    onExit(owner: Client): void {
        LogMgr.Info('State Exit: Connecting');
    }
}

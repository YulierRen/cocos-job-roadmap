import {IState} from '../../FSM';
import {Client} from '../Client';
import {LogMgr} from '../../LogMgr';

export class HasConnected implements IState<Client> {
    name = 'HasConnected';

    onEnter(owner: Client): void {
        LogMgr.Info('State Enter: HasConnected');
        owner.startHeartbeat();
    }

    onUpdate(owner: Client, dt: number): void {
        owner.checkHeartbeatTimeout();
    }

    onExit(owner: Client): void {
        LogMgr.Info('State Exit: HasConnected');
        owner.stopHeartbeat();
    }
}

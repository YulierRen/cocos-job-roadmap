import {_decorator, Component, Node} from 'cc';
import {IState} from 'db://assets/FrameWork/core/FSM';
import {PopupUI} from '../../ui/PopupUI';

export class ClosedState implements IState<PopupUI> {
    name = 'Closed';

    onEnter(owner: PopupUI, args?: any): void {
        console.log('进入关闭状态');
    }

    onUpdate(owner: PopupUI, dt: number): void {
        console.log('关闭状态更新');
    }

    onExit(owner: PopupUI): void {
        console.log('退出关闭状态');
    }
}

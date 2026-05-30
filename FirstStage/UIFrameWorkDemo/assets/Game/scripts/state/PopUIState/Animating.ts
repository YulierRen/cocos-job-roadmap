import {_decorator, Component, Node} from 'cc';
import {IState} from 'db://assets/FrameWork/core/FSM';
import {PopupUI} from '../../ui/PopupUI';

export class Animating implements IState<PopupUI> {
    name = 'Animating';

    onEnter(owner: PopupUI, args?: any): void {
        console.log('进入动画状态');
    }

    onUpdate(owner: PopupUI, dt: number): void {
        console.log('动画状态更新');
    }

    onExit(owner: PopupUI): void {
        console.log('退出动画状态');
    }
}

import {_decorator, Component, Node} from 'cc';
import {PopupUI} from '../../ui/PopupUI';
import {IState} from 'db://assets/FrameWork/core/FSM';
const {ccclass, property} = _decorator;

@ccclass('OpenState')
export class OpenState implements IState<PopupUI> {
    name = 'Open';

    onEnter(owner: PopupUI, args?: any): void {
        console.log('进入打开状态');
    }

    onUpdate(owner: PopupUI, dt: number): void {
        console.log('打开状态更新');
    }

    onExit(owner: PopupUI): void {
        console.log('退出打开状态');
    }
}

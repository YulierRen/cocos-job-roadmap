import { _decorator, Component, Node } from 'cc';
import { EventBus } from 'db://assets/FrameWork/core/EventBus';
import { EventType, UIType } from '../constant/constant';
import { ConfigMgr } from 'db://assets/FrameWork/core/ConfigMgr';
import { LogMgr } from 'db://assets/FrameWork/core/LogMgr';

export class MainUI extends Component {
    protected onLoad(): void {
        ConfigMgr.Instance.AddButtonEventByConfig(this.node);
    }
}



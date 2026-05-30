import { _decorator, Component, Label, Node } from 'cc';
import { EventBus } from 'db://assets/FrameWork/core/EventBus';
import { EventType, UIType } from '../constant/constant';
import { ConfigMgr } from 'db://assets/FrameWork/core/ConfigMgr';
import { LogMgr } from 'db://assets/FrameWork/core/LogMgr';
import { UIOpenParams } from 'db://assets/FrameWork/core/Types';

export class MainUI extends Component {
    protected onLoad(): void {
        ConfigMgr.Instance.AddButtonEventByConfig(this.node);
    }

    Init(udata?: UIOpenParams){
        if(!udata){
            return;
        }
        this.node.getChildByName("Label").getComponent(Label).string = udata.payload;
    }
}



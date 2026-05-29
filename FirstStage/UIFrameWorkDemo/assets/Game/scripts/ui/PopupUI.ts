import { _decorator, Component, Label, Node } from 'cc';
import { EventType, UIType } from '../constant/constant';
import { EventBus } from 'db://assets/FrameWork/core/EventBus';
import { UIManager } from 'db://assets/FrameWork/core/UIManager';
import { UIRoot } from 'db://assets/FrameWork/core/UIRoot';
import { ConfigMgr } from 'db://assets/FrameWork/core/ConfigMgr';
import { UIOpenParams } from 'db://assets/FrameWork/core/Types';

export class PopupUI extends Component {
    protected onLoad(): void {
        ConfigMgr.Instance.AddButtonEventByConfig(this.node);
    }

    Init(udata: UIOpenParams){
        this.node.getChildByName("Label").getComponent(Label).string = udata.payload;
    }

    
}



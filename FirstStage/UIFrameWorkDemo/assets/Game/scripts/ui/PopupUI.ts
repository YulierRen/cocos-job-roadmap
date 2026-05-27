import { _decorator, Component, Label, Node } from 'cc';
import { EventType, UIType } from '../constant/constant';
import { EventBus } from 'db://assets/FrameWork/core/EventBus';
import { UIManager } from 'db://assets/FrameWork/core/UIManager';
import { UIRoot } from 'db://assets/FrameWork/core/UIRoot';

export class PopupUI extends Component {
    protected onLoad(): void {
        this.AddButtonEvent(this.node.getChildByName("Button"));
    }

    Init(udata: any){
        this.node.getChildByName("Label").getComponent(Label).string = udata;
    }

    AddButtonEvent(node: Node){
        node.on("click",()=>{
            console.log("click");
            UIManager.Instance.UIPut(this.node, "PopupUI");
            UIRoot.Instance.ExitUI(this.node);
        })
    }
}



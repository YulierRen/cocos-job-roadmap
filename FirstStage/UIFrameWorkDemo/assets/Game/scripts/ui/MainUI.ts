import { _decorator, Component, Node } from 'cc';
import { EventBus } from 'db://assets/FrameWork/core/EventBus';
import { EventType, UIType } from '../constant/constant';

export class MainUI extends Component {
    protected onLoad(): void {
        this.AddButtonEvent(this.node.getChildByName("Button"));
    }


    AddButtonEvent(node: Node){
        node.on("click",()=>{
            console.log("click");
            EventBus.Instance.Emit(EventType.UI,UIType.PopupUI,"这里是传递的内容");
        })
    }
}



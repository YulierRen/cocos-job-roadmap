import { _decorator, Component, Node, Prefab } from 'cc';
import { UIManager } from './UIManager';


/**
 * 统一管理弹窗层级
 * */

export class UIRoot extends Component {
    public static Instance : UIRoot = null;

    private uiRoot: Node = null;

    protected onLoad(): void{
        if(UIRoot.Instance == null){
            UIRoot.Instance = this;
        }else{
            this.destroy();
        }

    }
    Init(){
        this.uiRoot = this.node.getChildByName("Root");
    }

    EnterUI(node : Node){
        if(this.uiRoot == null){
            console.error("UIRoot is null");
            return;
        }
        this.uiRoot.addChild(node);
    }

    ExitUI(node : Node){
        node.removeFromParent();
    }
}



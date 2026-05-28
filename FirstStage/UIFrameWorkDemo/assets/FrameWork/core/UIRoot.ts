import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { UIManager } from './UIManager';
import { ResMgr } from './ResMgr';


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

    /**
     * @param name : 界面名称，必须和资源名一致
     */
    async EnterUIByName(name : string) : Promise<Node>{
        const existNode = this.uiRoot.getChildByName(name);
        if(existNode != null){
            return existNode;
        }

        var node = UIManager.Instance.UIGet(name);
        if(node != null){
            this.uiRoot.addChild(node);
            return node;
        }
        var prefab = await ResMgr.Instance.GetAsset("GUI",name,Prefab) as Prefab;
        var node = instantiate(prefab) as Node;
        node.name = name;
        this.uiRoot.addChild(node);

        return node;
    }

    ExitUIByName(name : string){
        var node = this.uiRoot.getChildByName(name);
        if(node != null){
            UIManager.Instance.UIPut(node,name);
            node.removeFromParent();
        }
    }
}



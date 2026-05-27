import { _decorator, Component, instantiate, Node, Prefab } from 'cc';

export class UIManager extends Component {

    public static Instance : UIManager = null;

    private NodePool: any = {};


    protected onLoad(): void{
        if(UIManager.Instance == null){
            UIManager.Instance = this;
        }else{
            this.destroy();
        }
    }

    Init(){
        this.NodePool = {};
    }

    UIGet(name : string): Node{
        if(this.NodePool[name] != null && this.NodePool[name].length > 0){
            var node = this.NodePool[name].pop();
            return node;
        }
        return null;
    }


    UIPut(node: Node,name: string){
        if(this.NodePool[name] == null){
            this.NodePool[name] = [];
        }
        this.NodePool[name].push(node);
    }
}



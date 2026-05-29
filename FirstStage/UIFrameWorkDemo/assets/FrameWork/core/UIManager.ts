import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { ResMgr } from './ResMgr';
import { Bundle } from '../../Game/scripts/constant/constant';

export class UIManager extends Component {

    public static Instance : UIManager = null;

    private NodePool: any = {};
    private openUIStack: any = {};



    protected onLoad(): void{
        if(UIManager.Instance == null){
            UIManager.Instance = this;
        }else{
            this.destroy();
        }
    }

    Init(){
        this.NodePool = {};
        this.openUIStack = {};

    }

    async UIGet(name : string): Promise<Node>{
        if(this.NodePool[name] != null && this.NodePool[name].length > 0){
            const node = this.NodePool[name].pop();
            return node;
        }

        const prefab = await ResMgr.Instance.GetAsset(Bundle.Gui,name,Prefab) as Prefab;
        const node = instantiate(prefab) as Node;
        node.name = name;
        return node;
    }

    UIPut(node: Node,name: string){
        if(this.NodePool[name] == null){
            this.NodePool[name] = [];
        }
        this.NodePool[name].push(node);
    }

    async pushOpenUI(name: string): Promise<Node> {
        
        if(this.openUIStack[name] == null){
            this.openUIStack[name] = [];
        }
        const node = await this.UIGet(name);
        
        this.openUIStack[name].push(node);
        return node;
    }

    popOpenUI(node: Node,name: string): void{
        const popName = this.openUIStack[name].pop();
        if(popName != null){
            this.UIPut(node, name);
        }
    }

    topOpenUI(name: string): Node | null {
        if (this.openUIStack[name] == null || this.openUIStack[name].length === 0) {
            return null;
        }
        return this.openUIStack[name][this.openUIStack[name].length - 1];
    }
}



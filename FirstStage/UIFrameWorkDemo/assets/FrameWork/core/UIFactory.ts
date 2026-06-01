import {_decorator, Component, instantiate, Node, Prefab} from 'cc';
import {UIOpenParams} from './Types';
import {ResMgr} from './ResMgr';
import {Registry} from './Registry';
import {Bundle} from '../../Game/scripts/constant/constant';

export class UIFactory extends Component {
    public static Instance: UIFactory = null;

    protected onLoad(): void {
        if (UIFactory.Instance === null) {
            UIFactory.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    Init() {}

    async CreateUI(name: string, params?: UIOpenParams): Promise<Node> {
        var prefab = await ResMgr.Instance.GetAsset(Bundle.Gui, name, Prefab);
        var node = instantiate(prefab) as Node;
        node.name = name;
        this.AddComponentToNode(node, name);
        return node;
    }

    AddComponentToNode<T extends Component>(node: Node, name: string): T {
        const ctor = Registry.Instance.get(name);
        if (!ctor) throw new Error(`Unknown component: ${name}`);
        return node.addComponent(ctor) as T;
    }
}

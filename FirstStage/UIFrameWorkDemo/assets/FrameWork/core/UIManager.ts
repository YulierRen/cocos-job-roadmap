import {_decorator, Component, Node} from 'cc';
import {ObjectPool} from './ObjectPool';
import {UIFactory} from './UIFactory';

/**
 * 多个复合页面，但是不高频显示
 */
export class UIManager extends Component {
    public static Instance: UIManager = null;

    private openUIStack: any = {};

    protected onLoad(): void {
        if (UIManager.Instance == null) {
            UIManager.Instance = this;
        } else {
            this.destroy();
        }
    }

    Init() {
        this.openUIStack = {};
        ObjectPool.Instance?.Init();
    }

    async UIGet(name: string): Promise<Node> {
        const poolNode = ObjectPool.Instance?.Get(name);
        if (poolNode != null) {
            return poolNode;
        }

        return await UIFactory.Instance.CreateUI(name);
    }

    UIPut(node: Node, name: string) {
        ObjectPool.Instance?.Put(node, name);
    }

    async pushOpenUI(name: string): Promise<Node> {
        if (this.openUIStack[name] == null) {
            this.openUIStack[name] = [];
        }
        const node = await this.UIGet(name);

        this.openUIStack[name].push(node);
        return node;
    }

    popOpenUI(node: Node, name: string): void {
        const popName = this.openUIStack[name].pop();
        if (popName != null) {
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

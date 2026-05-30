import {_decorator, Component, Node} from 'cc';

/**
 * 高频显示的页面，使用对象池管理
 */
export class ObjectPool extends Component {
    public static Instance: ObjectPool = null;
    private nodePool: any = {};

    protected onLoad(): void {
        if (ObjectPool.Instance === null) {
            ObjectPool.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    Init(): void {
        this.nodePool = {};
    }

    Get(name: string): Node | null {
        if (this.nodePool[name] != null && this.nodePool[name].length > 0) {
            return this.nodePool[name].pop();
        }
        return null;
    }

    Put(node: Node, name: string): void {
        if (this.nodePool[name] == null) {
            this.nodePool[name] = [];
        }
        this.nodePool[name].push(node);
    }
}

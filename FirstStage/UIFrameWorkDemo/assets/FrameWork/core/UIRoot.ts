import {_decorator, Component, instantiate, Label, Node, Prefab} from 'cc';
import {UIManager} from './UIManager';
import {ResMgr} from './ResMgr';
import {Registry} from './Registry';

/**
 * 统一管理弹窗层级
 * */

export class UIRoot extends Component {
    public static Instance: UIRoot = null;

    private uiRoot: Node = null;

    protected onLoad(): void {
        if (UIRoot.Instance == null) {
            UIRoot.Instance = this;
        } else {
            this.destroy();
        }
    }
    Init() {
        this.uiRoot = this.node.getChildByName('Root');
    }

    UIAlreadyExist(name: string): boolean {
        if (this.uiRoot == null) {
            this.Init();
        }

        if (this.uiRoot == null) {
            return false;
        }

        return this.uiRoot.getChildByName(name) != null;
    }

    GetUIByName(name: string): Node | null {
        if (this.uiRoot == null) {
            this.Init();
        }

        if (this.uiRoot == null) {
            return null;
        }

        return this.uiRoot.getChildByName(name);
    }

    /**
     * @param name : 界面名称，必须和资源名一致
     * 可以打开多个的界面，用栈存储插入与删除的顺序
     */
    async EnterUIByName_Complex(name: string): Promise<Node> {
        const node = await UIManager.Instance.pushOpenUI(name);

        if (node != null) {
            this.uiRoot.addChild(node);
            return node;
        }
    }

    /**
     * @param name : 界面名称，必须和资源名一致
     * 只能打开一个的界面
     */
    async EnterUIByName_Singular(name: string): Promise<Node> {
        if (this.uiRoot == null) {
            this.Init();
        }
        const existNode = this.uiRoot.getChildByName(name);
        if (existNode != null) {
            return existNode;
        }

        var node = await UIManager.Instance.UIGet(name);
        if (node != null) {
            this.uiRoot.addChild(node);
            return node;
        }

        return node;
    }

    /**
     *
     * @param name
     * 单次的UI关闭
     */
    ExitUIByName_Singular(name: string) {
        var node = this.uiRoot.getChildByName(name);
        if (node != null) {
            UIManager.Instance.UIPut(node, name);
            node.removeFromParent();
        }
    }
    /**
     *
     * @param name
     * 复杂的UI关闭
     */
    ExitUIByName_Complex(name: string) {
        var node = UIManager.Instance.topOpenUI(name);
        if (node == null) {
            return;
        }
        if (node != null && node.name == name) {
            UIManager.Instance.popOpenUI(node, name);
            node.removeFromParent();
        }
    }
}

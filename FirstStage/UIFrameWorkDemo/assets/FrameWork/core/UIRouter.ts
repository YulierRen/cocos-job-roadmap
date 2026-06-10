import {_decorator, Component, Node} from 'cc';
import {UIOpenParams} from './Types';
import {UIRoot} from './UIRoot';
import {PopupUI} from '../../Game/scripts/ui/PopupUI';
import {Registry} from './Registry';

export class UIRouter extends Component {
    public static Instance: UIRouter = null;

    Init() {}
    protected onLoad(): void {
        if (UIRouter.Instance == null) {
            UIRouter.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    async open(params: UIOpenParams) {
        var node;
        if (params.canMultiOpen) {
            node = await UIRoot.Instance.EnterUIByName_Complex(params.uiName);
        } else {
            node = await UIRoot.Instance.EnterUIByName_Singular(params.uiName);
        }
        node.name = params.uiName;
        if (Registry.Instance.get(params.uiName) == null) {
            console.log(`No component registered for ${params.uiName}`);
            return;
        }
        if (node.getComponent(Registry.Instance.get(params.uiName)) == null) {
            node.addComponent(Registry.Instance.get(params.uiName)).Init(params);
        } else {
            node.getComponent(Registry.Instance.get(params.uiName)).Init(params);
        }
    }

    close(params: UIOpenParams) {
        if (params.canMultiOpen) {
            UIRoot.Instance.ExitUIByName_Complex(params.uiName);
        } else {
            UIRoot.Instance.ExitUIByName_Singular(params.uiName);
        }
    }
}

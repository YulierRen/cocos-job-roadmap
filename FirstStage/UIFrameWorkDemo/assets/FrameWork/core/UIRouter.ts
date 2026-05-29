import { _decorator, Component, Node } from 'cc';
import { UIOpenParams } from './Types';
import { UIRoot } from './UIRoot';
import { PopupUI } from '../../Game/scripts/ui/PopupUI';

export class UIRouter extends Component {

    public static Instance : UIRouter = null;

    Init(){

    }

    protected onLoad(): void{
        if(UIRouter.Instance == null){
            UIRouter.Instance = this;
        }else{
            this.destroy();
            return;
        }
    }

    async open(params: UIOpenParams){
        console.log("创建了",params.payload);
        var node;
        console.log("open",params.canMultiOpen)
        if(params.canMultiOpen){
            node = await UIRoot.Instance.EnterUIByName_Complex(params.uiName);
        }else{
            node = await UIRoot.Instance.EnterUIByName_Singular(params.uiName);
        }
        node.name = params.uiName;
        if(params.uiName == "PopupUI"){
            if(node.getComponent(PopupUI) == null){
                node.addComponent(PopupUI).Init(params);
            }
            else{
                node.getComponent(PopupUI).Init(params);
            }
        }
    }

    close(params: UIOpenParams){
        console.log("调用了close",params.canMultiOpen);
        if(params.canMultiOpen){
            UIRoot.Instance.ExitUIByName_Complex(params.uiName);
        }else{
            UIRoot.Instance.ExitUIByName_Singular(params.uiName);
        }
        
    }
}



import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { ResMgr } from 'db://assets/FrameWork/core/ResMgr';
import { UIManager } from 'db://assets/FrameWork/core/UIManager';
import { UIRoot } from 'db://assets/FrameWork/core/UIRoot';
import { MainUI } from '../ui/MainUI';
import { EventBus } from 'db://assets/FrameWork/core/EventBus';
import { Bundle, EventType, Gui, UIType } from '../constant/constant';
import { PopupUI } from '../ui/PopupUI';
import { UIOpenParams } from 'db://assets/FrameWork/core/Types';
import { UIRouter } from 'db://assets/FrameWork/core/UIRouter';


export class GameEntry extends Component {

    public static Instance : GameEntry = null;

    protected onLoad(): void{
        if(GameEntry.Instance == null){
            GameEntry.Instance = this;
        }
        else{
            this.destroy();
        }
        EventBus.Instance.AddEventListener(EventType.UI,this.OnUIEvent,this);
    }

    protected onDestroy(): void{
        EventBus.Instance.RemoveEventListener(EventType.UI,this.OnUIEvent,this);
    }

    async EnterGame(){
        var node = await UIRoot.Instance.EnterUIByName_Singular("MainUI");
        if(node.getComponent(MainUI) == null){
            node.addComponent(MainUI);
        }
    }
    

    async OnUIEvent(mainType: number,subType: number,udata: UIOpenParams){
        switch(subType){
            case UIType.OpenPopup:
                console.log("调用了OnUIEvent",udata.canMultiOpen);
                await this.EnterUI(udata);
                break;
            case UIType.ClosePopup:
                console.log("调用了OnUIEvent",udata.canMultiOpen);
                await this.ExitUI(udata);
                break;
            case UIType.SendTips:
                console.log("调用了OnUIEvent",udata.canMultiOpen);
                await this.EnterUI(udata);
                break;
        }
    }
    async EnterUI(udata : UIOpenParams){
        UIRouter.Instance.open(udata);
    }

    async ExitUI(udata : UIOpenParams){
        UIRouter.Instance.close(udata);
    }
}



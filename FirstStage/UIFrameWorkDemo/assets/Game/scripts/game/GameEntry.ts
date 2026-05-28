import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { ResMgr } from 'db://assets/FrameWork/core/ResMgr';
import { UIManager } from 'db://assets/FrameWork/core/UIManager';
import { UIRoot } from 'db://assets/FrameWork/core/UIRoot';
import { MainUI } from '../ui/MainUI';
import { EventBus } from 'db://assets/FrameWork/core/EventBus';
import { Bundle, EventType, Gui, UIType } from '../constant/constant';
import { PopupUI } from '../ui/PopupUI';


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
        var node = await UIRoot.Instance.EnterUIByName("MainUI");
        if(node.getComponent(MainUI) == null){
            node.addComponent(MainUI);
        }
    }
    

    async OnUIEvent(mainType: number,subType: number,udata: any){
        switch(subType){
            case UIType.MainUI:
                await this.EnterPopupUI(udata);
                break;
            case UIType.PopupUI:
                await this.ExitPopupUI(udata);
                break;
        }
    }

    async EnterPopupUI(udata : any){
        var node = await UIRoot.Instance.EnterUIByName("PopupUI");
        if(node.getComponent(PopupUI) == null){
            node.addComponent(PopupUI);
        }
    }

    async ExitPopupUI(udata : any){
        UIRoot.Instance.ExitUIByName("PopupUI");
    }
}



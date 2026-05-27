import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { ResMgr } from 'db://assets/FrameWork/core/ResMgr';
import { UIManager } from 'db://assets/FrameWork/core/UIManager';
import { UIRoot } from 'db://assets/FrameWork/core/UIRoot';
import { MainUI } from '../ui/MainUI';
import { EventBus } from 'db://assets/FrameWork/core/EventBus';
import { EventType, UIType } from '../constant/constant';
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

    async EnterGame(){
        var prefab = await ResMgr.Instance.GetAsset("GUI","MainUI",Prefab);
        var node = instantiate(prefab) as Node;
        node.addComponent(MainUI);
        UIRoot.Instance.EnterUI(node);
    }
    

    OnUIEvent(mainType: number,subType: number,udata: any){
        switch(subType){
            case UIType.PopupUI:
                console.log("OnUIEvent PopupUI");
                this.EnterPopupUI(udata);
        }
    }

    async EnterPopupUI(udata : any){

        var pooledNode = UIManager.Instance.UIGet("PopupUI");
        if(pooledNode != null){
            console.log("从对象池里拿");
            UIRoot.Instance.EnterUI(pooledNode);
            return;
        }else{
            var prefab = await ResMgr.Instance.GetAsset("GUI","PopupUI",Prefab) as Prefab;
            var node = instantiate(prefab) as Node;
            node.addComponent(PopupUI).Init(udata);
            UIRoot.Instance.EnterUI(node);
        }
    }
}



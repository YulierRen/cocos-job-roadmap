import { _decorator, Component, director, Node } from 'cc';
import { GameEntry } from '../Game/scripts/game/GameEntry';
import { UIRoot } from '../FrameWork/core/UIRoot';
import { UIManager } from '../FrameWork/core/UIManager';
import { EventBus } from '../FrameWork/core/EventBus';
import { ResMgr } from '../FrameWork/core/ResMgr';
import { ConfigMgr } from '../FrameWork/core/ConfigMgr';
const { ccclass, property } = _decorator;

@ccclass('Boot')
export class Boot extends Component {
    public static Instance : Boot = null;

    private getPersistTarget(): Node {
        const scene = director.getScene();
        let persistTarget = this.node;

        while (persistTarget.parent != null && persistTarget.parent !== scene) {
            persistTarget = persistTarget.parent;
        }

        return persistTarget;
    }

    protected onLoad(): void {
        if(Boot.Instance == null){
            Boot.Instance = this;
        }else{
            this.destroy();
            return;
        }
        
        director.addPersistRootNode(this.getPersistTarget());
        
        this.FrameWorkInit();
        
        
    }

    FrameWorkInit(){
        //事件总线
        this.node.addComponent(EventBus).Init();

        //资源管理器
        this.node.addComponent(ResMgr).Init();

        //配置加载器
        this.node.addComponent(ConfigMgr).Init();

        //层级管理器
        console.log("UIRoot Init",this.node.getChildByName("Root"));
        this.node.addComponent(UIRoot).Init();

        //界面管理器
        this.node.addComponent(UIManager).Init();


        //游戏入口
        this.node.addComponent(GameEntry).EnterGame();

    }
}



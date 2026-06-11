import {_decorator, Component, director, Node} from 'cc';
import {GameEntry} from '../Game/scripts/game/GameEntry';
import {UIRoot} from '../FrameWork/core/UIRoot';
import {UIManager} from '../FrameWork/core/UIManager';
import {EventBus} from '../FrameWork/core/EventBus';
import {ResMgr} from '../FrameWork/core/ResMgr';
import {ConfigMgr} from '../FrameWork/core/ConfigMgr';
import {UIRouter} from '../FrameWork/core/UIRouter';
import {Registry} from '../FrameWork/core/Registry';
import {UIFactory} from '../FrameWork/core/UIFactory';
import {ObjectPool} from '../FrameWork/core/ObjectPool';
import {NetMgr} from '../FrameWork/core/Net/NetMgr';
import {LogMgr} from '../FrameWork/core/LogMgr';
import {BagManager} from '../Game/scripts/Bag/model/BagManager';
import {ItemConfigDB} from '../Game/scripts/Bag/config/ItemConfigDB';
const {ccclass, property} = _decorator;

@ccclass('Boot')
export class Boot extends Component {
    public static Instance: Boot = null;

    private getPersistTarget(): Node {
        const scene = director.getScene();
        let persistTarget = this.node;

        while (persistTarget.parent != null && persistTarget.parent !== scene) {
            persistTarget = persistTarget.parent;
        }

        return persistTarget;
    }

    protected async onLoad(): Promise<void> {
        if (Boot.Instance == null) {
            Boot.Instance = this;
        } else {
            this.destroy();
            return;
        }

        director.addPersistRootNode(this.getPersistTarget());

        await this.FrameWorkInit();
    }

    async FrameWorkInit() {
        //日志管理器
        await this.node.addComponent(LogMgr).Init();
        //事件总线
        await this.node.addComponent(EventBus).Init();
        //资源管理器
        await this.node.addComponent(ResMgr).Init();
        //组件注册器
        await this.node.addComponent(Registry).Init();
        //配置加载器
        await this.node.addComponent(ConfigMgr).Init();
        //UI工厂
        await this.node.addComponent(UIFactory).Init();
        //节点池
        await this.node.addComponent(ObjectPool).Init();
        //层级管理器
        await this.node.addComponent(UIRoot).Init();
        //界面管理器
        await this.node.addComponent(UIManager).Init();
        //界面路由业务管理
        await this.node.addComponent(UIRouter).Init();
        //WebSocket管理器
        await this.node.addComponent(NetMgr).Init();
        //背包管理器
        await this.node.addComponent(BagManager).Init();
        //游戏入口
        await this.node.addComponent(GameEntry).EnterGame();
    }
}

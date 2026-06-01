import {_decorator, Component, Node} from 'cc';
import {UIOpenParams} from './Types';

export class EventBus extends Component {
    //全局单例的事件总线工具
    public static Instance: EventBus = null;

    private eventMap: any = {};

    protected onLoad(): void {
        if (EventBus.Instance == null) {
            EventBus.Instance = this;
        } else {
            this.destroy();
        }
    }
    Init() {
        this.eventMap = {};
    }

    AddEventListener(mainType: number, callback: Function, caller) {
        if (this.eventMap[mainType] == null) {
            this.eventMap[mainType] = [];
        }
        for (var i = 0; i < this.eventMap[mainType].length; i++) {
            if (this.eventMap[mainType][i].callback == callback && this.eventMap[mainType][i].caller == caller) {
                return;
            }
        }
        this.eventMap[mainType].push({callback: callback, caller: caller});
    }

    RemoveEventListener(mainType: number, callback: Function, caller) {
        if (this.eventMap[mainType] != null) {
            this.eventMap[mainType] = this.eventMap[mainType].filter((item) => item.callback !== callback || item.caller !== caller);
        }
    }

    Emit(mainType: number, subType: number, udata: UIOpenParams) {
        if (this.eventMap[mainType] != null) {
            for (var i = 0; i < this.eventMap[mainType].length; i++) {
                if (this.eventMap[mainType][i].callback != null) {
                    this.eventMap[mainType][i].callback.call(this.eventMap[mainType][i].caller, mainType, subType, udata);
                }
            }
        }
    }
}

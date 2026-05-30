import {_decorator, Component, Label, Node} from 'cc';
import {EventType, UIType} from '../constant/constant';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {UIManager} from 'db://assets/FrameWork/core/UIManager';
import {UIRoot} from 'db://assets/FrameWork/core/UIRoot';
import {ConfigMgr} from 'db://assets/FrameWork/core/ConfigMgr';
import {UIOpenParams} from 'db://assets/FrameWork/core/Types';
import {FSM} from 'db://assets/FrameWork/core/FSM';
import {Animating} from '../state/PopUIState/Animating';
import {ClosedState} from '../state/PopUIState/ClosedState';
import {OpenState} from '../state/PopUIState/OpenState';

export class PopupUI extends Component {
    private fsm!: FSM<PopupUI>;

    protected onLoad(): void {
        this.fsm = new FSM<PopupUI>(this).add(new Animating()).add(new ClosedState()).add(new OpenState());
        ConfigMgr.Instance.AddButtonEventByConfig(this.node);
    }

    Init(udata?: UIOpenParams) {
        if (!udata) {
            return;
        }
        this.node.getChildByName('Label').getComponent(Label).string = udata.payload;
    }

    Open() {
        if (this.fsm.getstateName() === 'Open') {
            return;
        }
        this.fsm.change('Open');
    }

    Close() {
        if (this.fsm.getstateName() === 'Closed') {
            return;
        }
        this.fsm.change('Closed');
    }
}

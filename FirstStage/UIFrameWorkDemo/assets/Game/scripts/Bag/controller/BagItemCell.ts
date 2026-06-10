import {_decorator, Component, Node} from 'cc';
import {UIOpenParams} from 'db://assets/FrameWork/core/Types';
import {UIRouter} from 'db://assets/FrameWork/core/UIRouter';

export class BagItemCell extends Component {
    private slotId = -1; //格子ID

    Init(slotId: number) {
        this.slotId = slotId;
        this.AddButtonClickEvent(this.node);
    }

    GetSlotId(): number {
        return this.slotId;
    }

    AddButtonClickEvent(node: Node) {
        node.on(Node.EventType.TOUCH_END, this.ShowItemDetails, this);
    }

    ShowItemDetails() {
        let uiParams: UIOpenParams = {
            uiName: 'ItemDetailPanel',
            timestamp: Date.now(),
            canMultiOpen: false,
            payload: this.slotId.toString()
        };
        console.log(uiParams);
        if (uiParams.payload == null) {
            console.error('No payload provided for ItemDetailPanel');
            return;
        }
        UIRouter.Instance.open(uiParams);
    }
}

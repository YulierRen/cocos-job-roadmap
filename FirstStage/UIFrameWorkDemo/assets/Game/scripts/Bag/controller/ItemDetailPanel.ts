import {_decorator, Component, Label, Node} from 'cc';
import {UIOpenParams} from 'db://assets/FrameWork/core/Types';
import {BagManager} from '../model/BagManager';
import {ItemConfigDB} from '../config/ItemConfigDB';

export class ItemDetailPanel extends Component {
    Init(params: UIOpenParams) {
        if (!BagManager.Instance.GetBagDataBySlotId(parseInt(params.payload))) {
            console.log('没有东西在这个格子里');
            return;
        }
        let itemId = BagManager.Instance.GetBagDataBySlotId(parseInt(params.payload)).itemId;
        this.node.getChildByPath('Name').getComponent(Label).string = ItemConfigDB.Instance.GetItemConfig(itemId).name;
        this.node.getChildByPath('Desc').getComponent(Label).string = ItemConfigDB.Instance.GetItemConfig(itemId).desc;
    }
}

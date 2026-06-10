import {_decorator, Component, Label, Node} from 'cc';
import {ResMgr} from 'db://assets/FrameWork/core/ResMgr';
import {UIFactory} from 'db://assets/FrameWork/core/UIFactory';
import {BagManager} from '../model/BagManager';
import {BagItemCell} from './BagItemCell';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';
import {ItemConfigDB} from '../config/ItemConfigDB';

export class BagPanel extends Component {
    private bagSlots: Node = null;

    async Init() {
        console.log('初始化背包界面');
        this.bagSlots = this.node.getChildByPath('Content/Left/ScrollView/View/content');
        this.bagSlots.removeAllChildren();
        for (let i = 0; i < BagManager.Instance.GetBagSize(); i++) {
            var slot = await UIFactory.Instance.CreateUI('BagItemCell');
            slot.getComponent(BagItemCell).Init(i);
            this.bagSlots.addChild(slot);
        }
        this.FlushBagPanel();
        EventBus.Instance.AddEventListener(EventType.UI, this.OnUIEvent, this);
    }

    OnUIEvent(mainType: number, subType: number, udata: any) {
        switch (subType) {
            case UIType.FlushBagPanel:
                this.FlushBagPanel();
                break;
        }
    }

    FlushBagPanel() {
        console.log('jiaoben刷新背包界面');
        let items = this.bagSlots.children;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let itemData = BagManager.Instance.GetBagDataBySlotId(i);
            if (itemData) {
                let icon = item.getChildByName('Icon');
                let countLabel = item.getChildByName('CountLabel');
                icon.active = true;
                countLabel.active = true;

                console.log(ItemConfigDB.Instance.GetItemConfig(itemData.itemId));
                icon.getComponent(Label).string = ItemConfigDB.Instance.GetItemConfig(itemData.itemId).name;
                countLabel.getComponent(Label).string = itemData.count.toString();
            }
        }
    }
}

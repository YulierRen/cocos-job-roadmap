import {_decorator, Component, Label, Node} from 'cc';
import {UIOpenParams} from 'db://assets/FrameWork/core/Types';
import {BagManager} from '../model/BagManager';
import {ItemConfigDB} from '../config/ItemConfigDB';
import {UIRouter} from 'db://assets/FrameWork/core/UIRouter';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';
import {ItemType} from '../config/ItemConfig';

export class ItemDetailPanel extends Component {
    private currentDisplayId = -1;

    protected onLoad(): void {
        this.node.getChildByPath('UseBtn').on(Node.EventType.TOUCH_END, this.UseItem, this);
        this.node.getChildByPath('DropBtn').on(Node.EventType.TOUCH_END, this.DropItem, this);
        this.node.getChildByPath('Close').on(Node.EventType.TOUCH_END, this.ClosePanel, this);
    }

    protected onDestroy(): void {
        EventBus.Instance.RemoveEventListener(EventType.UI, this.OnUIEvent, this);
    }

    Init(params: UIOpenParams) {
        const displayId = Number.parseInt(params.payload ?? '-1', 10);
        if (Number.isNaN(displayId) || displayId < 0) {
            console.log('无效的格子参数');
            return;
        }
        console.log('打开物品详情面板，displayID:', displayId);
        const itemData = BagManager.Instance.GetBagDataByDisplayId(displayId);
        if (!itemData || itemData.itemId === 0) {
            console.log('没有东西在这个格子里');
            return;
        }

        this.currentDisplayId = displayId;
        BagManager.Instance.viewSlotId = displayId;

        let itemId = itemData.itemId;
        EventBus.Instance.AddEventListener(EventType.UI, this.OnUIEvent, this);
        this.node.getChildByPath('Name').getComponent(Label).string = ItemConfigDB.Instance.GetItemConfig(itemId).name;
        this.node.getChildByPath('Desc').getComponent(Label).string = ItemConfigDB.Instance.GetItemConfig(itemId).desc;
        this.node.getChildByPath('Count').getComponent(Label).string = itemData.count.toString();
    }

    UseItem() {
        const itemData = BagManager.Instance.GetBagDataNow();
        if (!itemData) {
            console.error('No item data available for current slot');
            return;
        }
        const itemInfo = ItemConfigDB.Instance.GetItemConfig(itemData.itemId);
        console.log(itemInfo);
        if (itemInfo.type !== ItemType.Consumable) {
            const uiParams: UIOpenParams = {
                uiName: 'TipsUI',
                payload: '只能使用消耗品',
                timestamp: Date.now(),
                canMultiOpen: true
            };
            EventBus.Instance.Emit(EventType.UI, UIType.SendTips, uiParams);
            return;
        }
        BagManager.Instance.DropItem(itemData.itemId, 1);
    }
    DropItem() {
        const itemData = BagManager.Instance.GetBagDataNow();
        if (!itemData) {
            console.error('No item data available for current slot');
            return;
        }
        BagManager.Instance.DropItem(itemData.itemId, 1);
    }

    ClosePanel() {
        let uiParams: UIOpenParams = {
            uiName: 'ItemDetailPanel',
            timestamp: Date.now(),
            canMultiOpen: false,
            payload: this.currentDisplayId.toString()
        };
        console.log(uiParams);
        if (uiParams.payload == null) {
            console.error('No payload provided for ItemDetailPanel');
            return;
        }
        UIRouter.Instance.close(uiParams);
    }

    OnUIEvent(mainType: number, subType: number, udata: any) {
        switch (subType) {
            case UIType.FlushBagPanel:
                this.FlushDetailsPanel();
                break;
        }
    }

    FlushDetailsPanel() {
        const itemData = BagManager.Instance.GetBagDataNow();
        if (!itemData || itemData.itemId === 0 || itemData.count <= 0) {
            this.ClosePanel();
            return;
        }
        let itemId = BagManager.Instance.GetBagDataNow().itemId;

        this.node.getChildByPath('Name').getComponent(Label).string = ItemConfigDB.Instance.GetItemConfig(itemId).name;
        this.node.getChildByPath('Desc').getComponent(Label).string = ItemConfigDB.Instance.GetItemConfig(itemId).desc;
        this.node.getChildByPath('Count').getComponent(Label).string = BagManager.Instance.GetBagDataNow().count.toString();
    }
}

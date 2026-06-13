import {_decorator, Component, Label, Node} from 'cc';
import {UIOpenParams} from 'db://assets/FrameWork/core/Types';
import {BagManager, UseItemResult} from '../model/BagManager';
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
        console.log('物品数据', itemData);
        if (!itemData || itemData.itemId === 0) {
            console.log('没有东西在这个格子里');
            this.FlushDetailsPanel();
            return;
        }

        this.currentDisplayId = displayId;
        BagManager.Instance.viewSlotId = displayId;

        let itemId = itemData.itemId;
        EventBus.Instance.AddEventListener(EventType.UI, this.OnUIEvent, this);
        this.FlushDetailsPanel();
    }

    UseItem() {
        const itemData = BagManager.Instance.GetBagDataNow();
        if (!itemData) {
            console.error('No item data available for current slot');
            return;
        }
        const uiParams: UIOpenParams = {
            uiName: 'TipsUI',
            payload: '',
            timestamp: Date.now(),
            canMultiOpen: true
        };
        switch (BagManager.Instance.UseItemByDisplayId(this.currentDisplayId)) {
            case UseItemResult.Success:
                const itemInfo = ItemConfigDB.Instance.GetItemConfig(itemData.itemId);
                uiParams.payload = `使用了${itemInfo.name}`;
                switch (itemInfo.name) {
                    case '小型回血药':
                        uiParams.payload = `使用了${itemInfo.name}` + `，恢复了50点生命值`;
                        break;
                    case '小型回蓝药':
                        uiParams.payload = `使用了${itemInfo.name}` + `，恢复了50点法力值`;
                        break;
                }
                break;
            case UseItemResult.EmptySlot:
                uiParams.payload = '请选择物品';
                break;
            case UseItemResult.InvalidSlot:
                uiParams.payload = '请选择有效物品';
                break;
            case UseItemResult.NotUsable:
                uiParams.payload = '不可使用的物品';
                break;
        }
        EventBus.Instance.Emit(EventType.UI, UIType.SendTips, uiParams);
        this.FlushDetailsPanel();
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

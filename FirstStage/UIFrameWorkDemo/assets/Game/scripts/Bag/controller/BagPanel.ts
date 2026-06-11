import {_decorator, Component, Label, Node} from 'cc';
import {ResMgr} from 'db://assets/FrameWork/core/ResMgr';
import {UIFactory} from 'db://assets/FrameWork/core/UIFactory';
import {BagManager} from '../model/BagManager';
import {BagItemCell} from './BagItemCell';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';
import {ItemConfigDB} from '../config/ItemConfigDB';
import {ItemType} from '../config/ItemConfig';

export class BagPanel extends Component {
    private bagSlots: Node = null;
    private Slots: Node[] = [];
    private addItemBtn: Node = null;
    private dropItemBtn: Node = null;
    private randomItemIds: number[] = [1001, 1002, 2001, 2002, 3001, 4001];

    private filterCondition: ItemType = ItemType.None; // 当前的过滤条件，默认为不过滤
    protected onLoad(): void {
        this.addItemBtn = this.node.getChildByPath('Content/TopBar/AddRandomItem');
        this.AddBtnAddEvent(this.addItemBtn);
        this.dropItemBtn = this.node.getChildByPath('Content/TopBar/DropRandomItem');
        this.AddBtnDropEvent(this.dropItemBtn);

        this.node.getChildByPath('Content/TopBar/Button0').on(Node.EventType.TOUCH_END, () => {
            this.filterCondition = ItemType.None;
            this.FlushBagPanel();
        });
        this.node.getChildByPath('Content/TopBar/Button1').on(Node.EventType.TOUCH_END, () => {
            this.filterCondition = ItemType.Consumable;
            this.FlushBagPanel();
        });
        this.node.getChildByPath('Content/TopBar/Button2').on(Node.EventType.TOUCH_END, () => {
            this.filterCondition = ItemType.Equipment;
            this.FlushBagPanel();
        });
        this.node.getChildByPath('Content/TopBar/Button3').on(Node.EventType.TOUCH_END, () => {
            this.filterCondition = ItemType.Material;
            this.FlushBagPanel();
        });
        this.node.getChildByPath('Content/TopBar/Button4').on(Node.EventType.TOUCH_END, () => {
            this.filterCondition = ItemType.Quest;
            this.FlushBagPanel();
        });
    }

    async Init() {
        this.filterCondition = ItemType.None; // 初始化时不过滤

        console.log('初始化背包界面');
        this.bagSlots = this.node.getChildByPath('Content/Left/ScrollView/View/content');

        await this.InitAllBagSlots();
        this.FlushBagPanel();
        EventBus.Instance.AddEventListener(EventType.UI, this.OnUIEvent, this);
    }

    AddBtnAddEvent(node: Node) {
        node.on(Node.EventType.TOUCH_END, () => {
            const randomIndex = Math.floor(Math.random() * this.randomItemIds.length);
            const randomItemId = this.randomItemIds[randomIndex];
            const itemConfig = ItemConfigDB.Instance.GetItemConfig(randomItemId);
            const maxStack = itemConfig?.maxStack ?? 1;
            const randomCount = Math.floor(Math.random() * maxStack) + 1;
            BagManager.Instance.AddItem(randomItemId, randomCount);
        });
    }

    AddBtnDropEvent(node: Node) {
        node.on(Node.EventType.TOUCH_END, () => {
            const ItemId = BagManager.Instance.GetBagDataBySlotId(BagManager.Instance.nowSlotId)?.itemId;
            const itemConfig = ItemConfigDB.Instance.GetItemConfig(ItemId);
            const maxStack = itemConfig?.maxStack ?? 1;
            const randomCount = Math.floor(Math.random() * maxStack) + 1;
            BagManager.Instance.DropItem(ItemId, randomCount);
        });
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
        this.bagSlots.removeAllChildren();
        let items = this.Slots;
        for (let i = 0; i < items.length; i++) {
            //获取节点和数据
            let item = items[i];
            let itemData = BagManager.Instance.GetBagDataBySlotId(i);
            //渲染数据
            if (itemData && ItemConfigDB.Instance.GetItemConfig(itemData.itemId)) {
                let icon = item.getChildByName('Icon');
                let countLabel = item.getChildByName('CountLabel');
                icon.active = true;
                countLabel.active = true;

                icon.getComponent(Label).string = ItemConfigDB.Instance.GetItemConfig(itemData.itemId).name;
                countLabel.getComponent(Label).string = itemData.count.toString();
            } else {
                let icon = item.getChildByName('Icon');
                let countLabel = item.getChildByName('CountLabel');
                icon.active = true;
                countLabel.active = true;

                icon.getComponent(Label).string = '空';
                countLabel.getComponent(Label).string = '0';
            }
            if (this.filterCondition === ItemType.None) {
                this.bagSlots.addChild(item);
                console.log('添加格子', item.name);
                continue;
            }
            //根据当前的过滤条件决定是否显示
            if (this.filterCondition !== null && itemData && ItemConfigDB.Instance.GetItemConfig(itemData.itemId).type !== this.filterCondition) {
                item.removeFromParent();
                continue;
            }
            if (this.filterCondition !== null && itemData && ItemConfigDB.Instance.GetItemConfig(itemData.itemId).type === this.filterCondition) {
                this.bagSlots.addChild(item);
                continue;
            }
        }
    }

    async InitAllBagSlots() {
        this.bagSlots.removeAllChildren();
        for (let i = 0; i < BagManager.Instance.GetBagSize(); i++) {
            var slot = await UIFactory.Instance.CreateUI('BagItemCell');
            slot.getComponent(BagItemCell).Init(i);
            this.bagSlots.addChild(slot);
            this.Slots.push(slot);
        }
    }
}

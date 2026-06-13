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
    private stateLabel: Label = null;
    private filterCondition: ItemType = ItemType.None;
    private sortCondition: number = 0;
    private readonly randomItemIds: number[] = [1001, 1002, 2001, 2002, 3001, 4001];
    private readonly filterTypes: ItemType[] = [ItemType.None, ItemType.Consumable, ItemType.Equipment, ItemType.Material, ItemType.Quest];

    protected onLoad(): void {
        this.stateLabel = this.node.getChildByPath('Content/TopBar/State').getComponent(Label);

        this.BindAddItemEvent();
        this.BindDropItemEvent();
        this.BindClearItemEvent();
        this.BindFilterButtons();
        this.BindSortButton();
    }

    private BindAddItemEvent(): void {
        this.node.getChildByPath('Content/TopBar/AddRandomItem').on(Node.EventType.TOUCH_END, () => {
            const randomIndex = Math.floor(Math.random() * this.randomItemIds.length);
            const randomItemId = this.randomItemIds[randomIndex];
            const itemConfig = ItemConfigDB.Instance.GetItemConfig(randomItemId);
            const maxStack = itemConfig?.maxStack ?? 1;
            const randomCount = Math.floor(Math.random() * maxStack) + 1;
            BagManager.Instance.AddItem(randomItemId, randomCount);
        });
    }

    private BindDropItemEvent(): void {
        this.node.getChildByPath('Content/TopBar/DropRandomItem').on(Node.EventType.TOUCH_END, () => {
            const selected = BagManager.Instance.GetBagDataByDisplayId(BagManager.Instance.viewSlotId);
            if (!selected || selected.itemId === 0) {
                console.warn('当前未选中可丢弃的物品');
                return;
            }

            const ItemId = selected.itemId;
            const itemConfig = ItemConfigDB.Instance.GetItemConfig(ItemId);
            const maxStack = itemConfig?.maxStack ?? 1;
            const randomCount = Math.floor(Math.random() * maxStack) + 1;
            BagManager.Instance.DropItem(ItemId, randomCount);
        });
    }
    private BindClearItemEvent() {
        this.node.getChildByPath('Content/TopBar/ButtonClear').on(Node.EventType.TOUCH_END, () => {
            BagManager.Instance.ClearItems();
            this.FlushBagPanel();
        });
    }

    private BindFilterButtons(): void {
        this.filterTypes.forEach((type, index) => {
            this.node.getChildByPath(`Content/TopBar/Button${index}`).on(Node.EventType.TOUCH_END, () => {
                this.filterCondition = type;
                this.FlushBagPanel();
            });
        });
    }

    private BindSortButton(): void {
        this.node.getChildByPath('Content/TopBar/ButtonSort').on(Node.EventType.TOUCH_END, () => {
            BagManager.Instance.ItemsSortedByQuality();
            this.sortCondition = 1;
            this.FlushBagPanel();
        });
    }

    async Init() {
        console.log('初始化背包界面');
        this.bagSlots = this.node.getChildByPath('Content/Left/ScrollView/View/content');
        await this.InitAllBagSlots();
        this.FlushBagPanel();
        EventBus.Instance.AddEventListener(EventType.UI, this.OnUIEvent, this);
    }

    private OnUIEvent(mainType: number, subType: number, udata: any) {
        if (subType === UIType.FlushBagPanel) {
            this.FlushBagPanel();
        }
    }

    FlushBagPanel() {
        this.UpdateStateLabel();
        this.bagSlots.removeAllChildren();

        for (let i = 0; i < this.Slots.length; i++) {
            const item = this.Slots[i];
            const itemData = BagManager.Instance.GetBagDataByDisplayId(i);

            this.RenderSlotItem(item, itemData);

            if (this.ShouldDisplayItem(itemData)) {
                this.bagSlots.addChild(item);
            }
        }
    }

    private UpdateStateLabel(): void {
        this.stateLabel.string = `当前过滤: ${this.StateTransform(this.filterCondition)}, 当前排序: ${this.SortTransform(this.sortCondition)}`;
    }

    private RenderSlotItem(item: Node, itemData: any): void {
        const icon = item.getChildByName('Icon').getComponent(Label);
        const countLabel = item.getChildByName('CountLabel').getComponent(Label);
        const redPoint = item.getChildByName('RedPoint');

        if (itemData?.isNew) {
            redPoint.active = true;
        } else {
            redPoint.active = false;
        }

        if (itemData?.itemId) {
            const config = ItemConfigDB.Instance.GetItemConfig(itemData.itemId);
            if (config) {
                icon.string = config.name;
                countLabel.string = itemData.count.toString();
                return;
            }
        }

        icon.string = '空';
        countLabel.string = '0';
    }

    private ShouldDisplayItem(itemData: any): boolean {
        if (this.filterCondition === ItemType.None) return true;
        if (!itemData?.itemId) return false;

        const config = ItemConfigDB.Instance.GetItemConfig(itemData.itemId);
        return config && config.type === this.filterCondition;
    }

    private StateTransform(state: ItemType): string {
        const stateMap: Record<ItemType, string> = {
            [ItemType.None]: '无',
            [ItemType.Consumable]: '消耗品',
            [ItemType.Equipment]: '装备',
            [ItemType.Material]: '材料',
            [ItemType.Quest]: '任务'
        };
        return stateMap[state] ?? '未知';
    }

    private SortTransform(state: number): string {
        return state === 0 ? '默认' : '按品质排序';
    }

    private async InitAllBagSlots() {
        this.bagSlots.removeAllChildren();
        for (let i = 0; i < BagManager.Instance.GetBagSize(); i++) {
            const slot = await UIFactory.Instance.CreateUI('BagItemCell');
            slot.getComponent(BagItemCell).Init(i);
            slot.getChildByName('RedPoint').active = false;
            this.Slots.push(slot);
        }
    }
}

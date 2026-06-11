import {_decorator, Component, Node} from 'cc';
import {BagSlotData} from '../config/BagData';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';
import {ItemConfigDB} from '../config/ItemConfigDB';
import {ItemType} from '../config/ItemConfig';

export class BagManager extends Component {
    public static Instance: BagManager = null;

    private Capacity = 30; //背包容量

    private BagData: Array<BagSlotData> = new Array<BagSlotData>();

    public nowSlotId = -1; //当前操作的格子ID

    protected onLoad(): void {
        if (BagManager.Instance == null) {
            BagManager.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    async Init() {
        await ItemConfigDB.Instance.Init();
        this.Capacity = 30;
        this.BagData = new Array(this.Capacity).fill(null).map((_, i) => ({
            slotIndex: i,
            itemId: 0,
            count: 0
        }));

        //测试用数据
        this.AddItem(1001, 10);
        this.AddItem(1002, 6);
        this.AddItem(2001, 1);
        this.AddItem(2002, 1);
        this.AddItem(3001, 25);
        this.AddItem(4001, 1);
        this.AddItem(1001, 99);
        this.AddItem(3001, 8);
        console.log('背包数据', this.BagData);
    }

    AddItem(itemId: number, itemCount: number): boolean {
        const itemConfig = ItemConfigDB.Instance.GetItemConfig(itemId);
        if (!itemConfig) {
            console.error(`物品配置不存在: ${itemId}`);
            return false;
        }

        let remainingCount = itemCount;

        for (let i = 0; i < this.Capacity && remainingCount > 0; i++) {
            const bagItem = this.BagData[i];
            if (bagItem.itemId !== itemId || bagItem.count >= itemConfig.maxStack) {
                continue;
            }

            const canAddCount = itemConfig.maxStack - bagItem.count;
            const addCount = Math.min(remainingCount, canAddCount);
            bagItem.count += addCount;
            remainingCount -= addCount;
        }

        for (let i = 0; i < this.Capacity && remainingCount > 0; i++) {
            const bagItem = this.BagData[i];
            if (bagItem.itemId !== 0) {
                continue;
            }

            const addCount = Math.min(remainingCount, itemConfig.maxStack);
            this.BagData[i] = {
                slotIndex: i,
                itemId: itemId,
                count: addCount
            };
            remainingCount -= addCount;
        }

        if (remainingCount > 0) {
            console.error('格子已满');
            this.FlushBagPanel();
            return false;
        }

        this.FlushBagPanel();
        return true;
    }

    DropItem(itemId: number, itemCount: number): boolean {
        const bagItem = this.BagData.find((item) => item.slotIndex === this.nowSlotId && item.itemId === itemId);
        if (!bagItem) {
            console.error(`未找到物品ID: ${itemId}，格子: ${this.nowSlotId}`);
            return false;
        }

        if (bagItem.count < itemCount) {
            console.error('物品数量不足');
            return false;
        }

        bagItem.count -= itemCount;
        if (bagItem.count <= 0) {
            bagItem.itemId = 0;
            bagItem.count = 0;
        }

        console.log('删除了物品ID:', itemId, '数量:', itemCount);

        this.FlushBagPanel();
        return true;
    }

    GetGridInfo(gridId: number) {
        for (const item of this.BagData) {
            if (item.slotIndex === gridId) {
                return item;
            }
        }
    }

    GetBagSize() {
        return this.Capacity;
    }

    GetBagData() {
        return this.BagData;
    }
    GetBagDataNow() {
        return this.BagData[this.nowSlotId] ?? null;
    }
    GetBagDataBySlotId(slotId: number) {
        return this.BagData[slotId] ?? null;
    }

    GetItemsSortedByQuality() {
        this.BagData.sort((a, b) => {
            const itemA = ItemConfigDB.Instance.GetItemConfig(a.itemId);
            const itemB = ItemConfigDB.Instance.GetItemConfig(b.itemId);
            const qualityA = itemA ? itemA.quality : 0;
            const qualityB = itemB ? itemB.quality : 0;
            return qualityB - qualityA; // 降序排序
        });
        return this.BagData;
    }
    GetItemsByType(type: ItemType) {
        return this.BagData.filter((item) => {
            const itemConfig = ItemConfigDB.Instance.GetItemConfig(item.itemId);
            return itemConfig && itemConfig.type === type;
        });
    }

    FlushBagPanel() {
        console.log('刷新背包界面');
        EventBus.Instance.Emit(EventType.UI, UIType.FlushBagPanel, null);
    }
}

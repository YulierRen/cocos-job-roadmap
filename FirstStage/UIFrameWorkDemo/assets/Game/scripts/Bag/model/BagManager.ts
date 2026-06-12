import {_decorator, Component, sys} from 'cc';
import {BagSlotData} from '../config/BagData';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';
import {ItemConfigDB} from '../config/ItemConfigDB';
import {ItemType} from '../config/ItemConfig';

export class BagManager extends Component {
    public static Instance: BagManager = null;

    private Capacity = 30; //背包容量
    private readonly StorageKey = 'bag_data_v1';

    private BagData: Array<BagSlotData> = new Array<BagSlotData>();

    public viewSlotId = -1; //当前操作的格子ID

    private displaySlotIds: number[] = [];

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
        this.BagData = this.LoadBagData() ?? this.CreateDefaultBagData();
        this.displaySlotIds = new Array(this.Capacity).fill(0).map((_, i) => i);

        // if (this.BagData.every((item) => item.itemId === 0)) {
        //     //测试用数据
        //     this.AddItem(1001, 10);
        //     this.AddItem(1002, 6);
        //     this.AddItem(2001, 1);
        //     this.AddItem(2002, 1);
        //     this.AddItem(3001, 25);
        //     this.AddItem(4001, 1);
        //     this.AddItem(1001, 99);
        //     this.AddItem(3001, 8);
        // }

        console.log('背包数据', this.BagData);
    }

    private CreateDefaultBagData(): Array<BagSlotData> {
        return new Array(this.Capacity).fill(null).map((_, i) => ({
            slotIndex: i,
            itemId: 0,
            count: 0,
            isNew: false
        }));
    }

    SaveBagData(data: Array<BagSlotData>) {
        try {
            sys.localStorage.setItem(this.StorageKey, JSON.stringify(data));
        } catch (error) {
            console.error('保存背包数据失败', error);
        }
    }

    LoadBagData() {
        try {
            const rawData = sys.localStorage.getItem(this.StorageKey);
            if (!rawData) {
                return null;
            }

            const parsedData = JSON.parse(rawData);
            if (!Array.isArray(parsedData)) {
                return null;
            }

            const defaultData = this.CreateDefaultBagData();
            for (let i = 0; i < this.Capacity; i++) {
                const item = parsedData[i];
                if (!item) {
                    continue;
                }

                defaultData[i] = {
                    slotIndex: i,
                    itemId: Number(item.itemId) || 0,
                    count: Number(item.count) || 0,
                    isNew: Boolean(item.isNew)
                };
            }

            return defaultData;
        } catch (error) {
            console.error('读取背包数据失败', error);
            return null;
        }
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
                count: addCount,
                isNew: true
            };
            remainingCount -= addCount;
        }

        if (remainingCount > 0) {
            console.error('格子已满');
            this.SaveBagData(this.BagData);
            this.FlushBagPanel();
            return false;
        }

        this.SaveBagData(this.BagData);
        this.FlushBagPanel();
        return true;
    }

    DropItem(itemId: number, itemCount: number): boolean {
        // nowSlotId 是显示位置（displayId），需要通过 displaySlotIds 转换为物理位置
        const physicalSlotId = this.displaySlotIds[this.viewSlotId];
        const bagItem = this.BagData[physicalSlotId];

        if (!bagItem || bagItem.itemId !== itemId) {
            console.error(`未找到物品ID: ${itemId}，格子: ${this.viewSlotId}`);
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
            bagItem.isNew = false;
        }

        console.log('删除了物品ID:', itemId, '数量:', itemCount);

        this.SaveBagData(this.BagData);
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
        // nowSlotId 是显示位置，需要通过 displaySlotIds 转换为物理位置
        if (this.viewSlotId < 0 || this.viewSlotId >= this.displaySlotIds.length) {
            return null;
        }
        return this.BagData[this.displaySlotIds[this.viewSlotId]] ?? null;
    }
    GetBagDataByDisplayId(displayId: number) {
        if (displayId < 0 || displayId >= this.displaySlotIds.length) {
            return null;
        }
        return this.BagData[this.displaySlotIds[displayId]] ?? null;
    }

    ItemsSortedByQuality() {
        // 只排序显示映射，不改变物理存储顺序
        this.displaySlotIds.sort((slotA, slotB) => {
            const itemA = this.BagData[slotA];
            const itemB = this.BagData[slotB];

            // 空槽放最后
            if (itemA.itemId === 0 && itemB.itemId !== 0) return 1;
            if (itemA.itemId !== 0 && itemB.itemId === 0) return -1;
            if (itemA.itemId === 0 && itemB.itemId === 0) return 0;

            const configA = ItemConfigDB.Instance.GetItemConfig(itemA.itemId);
            const configB = ItemConfigDB.Instance.GetItemConfig(itemB.itemId);

            const qualityA = configA ? configA.quality : 0;
            const qualityB = configB ? configB.quality : 0;
            if (qualityA !== qualityB) {
                return qualityB - qualityA; // 品质降序
            }

            return itemB.itemId - itemA.itemId; // 同品质按 itemId 降序
        });

        this.FlushBagPanel();
    }
    GetItemsByType(type: ItemType) {
        return this.BagData.filter((item) => {
            const itemConfig = ItemConfigDB.Instance.GetItemConfig(item.itemId);
            return itemConfig && itemConfig.type === type;
        });
    }

    MarkItemNotNew(displayId: number) {
        if (displayId < 0 || displayId >= this.displaySlotIds.length) {
            return;
        }
        const bagItem = this.BagData[this.displaySlotIds[displayId]];
        if (bagItem) {
            bagItem.isNew = false;
            this.SaveBagData(this.BagData);
        }
        this.FlushBagPanel();
    }
    HasAnyNewItem(): boolean {
        return this.BagData.some((item) => item.itemId !== 0 && item.isNew);
    }

    FlushBagPanel() {
        console.log('刷新背包界面');
        EventBus.Instance.Emit(EventType.UI, UIType.FlushBagPanel, null);
    }
}

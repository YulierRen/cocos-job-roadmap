import {_decorator, Component, Node} from 'cc';
import {BagSlotData} from '../config/BagData';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';

export class BagManager extends Component {
    public static Instance: BagManager = null;

    private Capacity = 30; //背包容量

    private BagData: Array<BagSlotData> = new Array<BagSlotData>();

    protected onLoad(): void {
        if (BagManager.Instance == null) {
            BagManager.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    Init() {
        this.Capacity = 30;
        this.BagData = new Array<BagSlotData>();

        //测试用数据
        this.AddItem(1001, 10, 0);
        this.AddItem(1002, 6, 1);
        this.AddItem(2001, 1, 2);
        this.AddItem(2002, 1, 3);
        this.AddItem(3001, 25, 4);
        this.AddItem(4001, 1, 5);
        this.AddItem(1001, 99, 6);
        this.AddItem(3001, 8, 7);
        console.log('背包数据', this.BagData);
    }

    AddItem(itemId: number, itemCount: number, slotIndex: number) {
        //根据配置找物品添加到背包
        const item: BagSlotData = {
            slotIndex: slotIndex,
            itemId: itemId,
            count: itemCount
        };
        this.BagData.push(item);
        //刷新背包界面
        this.FlushBagPanel();
    }

    DropItem(itemId: number, itemCount: number, slotIndex: number) {
        this.BagData.forEach((item) => {
            if (item.slotIndex === slotIndex) {
                item.count -= itemCount;
                if (item.count <= 0) {
                    this.BagData.splice(this.BagData.indexOf(item), 1);
                }
            }
        });

        this.FlushBagPanel();
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

    GetBagDataBySlotId(slotId: number) {
        if (slotId < 0 || slotId >= this.Capacity) {
            console.error(`无效的格子ID: ${slotId}`);
            return null;
        }
        if (this.BagData.filter((item) => item.slotIndex === slotId).length === 0) {
            return null;
        }

        return this.BagData.find((item) => item.slotIndex === slotId);
    }

    FlushBagPanel() {
        console.log('刷新背包界面');
        EventBus.Instance.Emit(EventType.UI, UIType.FlushBagPanel, null);
    }
}

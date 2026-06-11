import {_decorator, Component, JsonAsset, Node} from 'cc';
import {ItemConfig, ItemType} from './ItemConfig';
import {ResMgr} from 'db://assets/FrameWork/core/ResMgr';
import {Bundle, Config} from '../../constant/constant';

export class ItemConfigDB {
    public static Instance: ItemConfigDB = new ItemConfigDB();
    private itemConfigMap: Map<number, ItemConfig> = new Map<number, ItemConfig>();

    async Init() {
        this.itemConfigMap = new Map<number, ItemConfig>();
        let itemJson = (await ResMgr.Instance.GetAsset(Bundle.Config, Config.BagItemConfig, JsonAsset)) as JsonAsset | null;
        if (!itemJson || !Array.isArray(itemJson.json)) {
            console.error('[ItemConfigDB] bag_item_config 加载失败或格式错误');
            return;
        }

        let itemConfigList = itemJson.json as Array<ItemConfig>;
        itemConfigList.forEach((itemConfig) => {
            this.itemConfigMap.set(itemConfig.id, itemConfig);
        });
    }

    GetItemConfig(itemId: number): ItemConfig | undefined {
        if (!this.itemConfigMap.has(itemId)) {
            const nullConfig: ItemConfig = {
                id: itemId,
                name: '空',
                icon: '',
                quality: 0,
                maxStack: 0,
                desc: '',
                type: null
            };
            return nullConfig;
        }
        return this.itemConfigMap.get(itemId);
    }
}

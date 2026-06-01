import {_decorator, Component, JsonAsset, Node} from 'cc';
import {ResMgr} from './ResMgr';
import {Bundle, Config, EventType, UIType, WSType} from '../../Game/scripts/constant/constant';
import {LogMgr} from './LogMgr';
import {EventBus} from './EventBus';
import {UIOpenParams} from './Types';

export class ConfigData {
    buttonNodeName: string;
    eventMainType: EventType;
    eventSubType: any;
    payload: string;
    targetUI: string;
    canMultiOpen: boolean;
}

export class ConfigMgr extends Component {
    public static Instance: ConfigMgr = null;
    private uiConfigCache: any = null;

    protected onLoad(): void {
        if (ConfigMgr.Instance == null) {
            ConfigMgr.Instance = this;
        } else {
            this.destroy();
            return;
        }
        this.loadConfig();
    }

    Init() {}
    /**
     *
     * @param node : 传node根节点，ConfigMgr会根据这个节点的名字去配置文件里找对应的按钮配置，然后给每个按钮添加事件
     * @returns
     */

    async AddButtonEventByConfig(node: Node) {
        var config = await ConfigMgr.Instance.getAllButtonConfigs(node.name);

        if (!config) {
            return;
        }
        config.forEach((item) => {
            var buttonNode = node.getChildByName(item.buttonNodeName);
            var uiOpenParams: UIOpenParams = {
                uiName: item.targetUI,
                payload: item.payload,
                source: item.buttonNodeName,
                timestamp: Date.now(),
                canMultiOpen: item.canMultiOpen
            };
            if (buttonNode != null) {
                this.AddButtonEvent(buttonNode, item.eventMainType, item.eventSubType, uiOpenParams);
            } else {
                console.log(`MainUI loadButton buttonNode ${item.buttonNodeName} not found`);
            }
        });
    }
    AddButtonEvent(node: Node, eventMainType: EventType, eventSubType: UIType, udata: UIOpenParams) {
        if ((node as any).__configClickBound) {
            return;
        }
        (node as any).__configClickBound = true;

        node.on(Node.EventType.TOUCH_END, () => {
            EventBus.Instance.Emit(eventMainType, eventSubType, udata);
        });
    }

    async getAllButtonConfigs(UIName: string): Promise<ConfigData[] | null> {
        const configData = await this.getUIConfigData();
        if (configData == null) {
            LogMgr.Warn('ConfigMgr getAllButtonConfigs configData is null');
            return null;
        }

        if (configData[UIName] == null) {
            LogMgr.Warn(`ConfigMgr getAllButtonConfigs UIName ${UIName} not found`);
            return null;
        }

        const uiConfigs = configData[UIName] as Array<any>;
        const result = uiConfigs.map((item) => {
            const configDataObj = new ConfigData();
            configDataObj.buttonNodeName = item.buttonNodeName;
            if (item.eventMainType == null || item.eventSubType == null) {
            }
            configDataObj.eventMainType = this.parseEnumValue(item.eventMainType, 'EventType', EventType) as EventType;
            configDataObj.eventSubType = this.parseEnumValue(item.eventSubType, 'UIType', UIType) as UIType;
            configDataObj.eventSubType = this.parseEnumValue(item.eventSubType, 'WSType', WSType) as WSType;
            configDataObj.payload = item.payload;
            configDataObj.targetUI = item.targetUI;
            configDataObj.canMultiOpen = item.canMultiOpen;
            return configDataObj;
        });

        return result;
    }

    async getConfigByButtonName(UIName: string, buttonNodeName: string): Promise<ConfigData | null> {
        const configData = await this.getUIConfigData();
        if (configData == null) {
            LogMgr.Warn('ConfigMgr getConfigByButtonName configData is null');
            return null;
        }

        if (configData[UIName] == null) {
            LogMgr.Warn(`ConfigMgr getConfigByButtonName UIName ${UIName} not found`);
            return null;
        }

        const uiConfigs = configData[UIName] as Array<any>;
        const result = uiConfigs.find((item) => item.buttonNodeName === buttonNodeName);

        if (result == null) {
            LogMgr.Warn(`ConfigMgr getConfigByButtonName buttonNodeName ${buttonNodeName} not found in ${UIName}`);
            return null;
        }

        const configDataObj = new ConfigData();
        configDataObj.buttonNodeName = result.buttonNodeName;
        configDataObj.eventMainType = this.parseEnumValue(result.eventMainType, 'EventType', EventType) as EventType;
        configDataObj.eventSubType = this.parseEnumValue(result.eventSubType, 'UIType', UIType) as UIType;
        configDataObj.payload = result.payload;
        configDataObj.targetUI = result.targetUI;
        configDataObj.canMultiOpen = result.canMultiOpen;

        return configDataObj;
    }

    async getConfigById(UIName: string, id: string): Promise<ConfigData | null> {
        // 这里可以根据UIName和id从配置中获取对应的配置项
        const configData = await this.getUIConfigData();
        if (configData == null) {
            LogMgr.Warn('ConfigMgr getConfigById configData is null');
            return null;
        }

        if (configData[UIName] == null) {
            LogMgr.Warn(`ConfigMgr getConfigById UIName ${UIName} not found`);
            return null;
        }

        const uiConfigs = configData[UIName] as Array<any>;
        const result = uiConfigs.find((item) => item.id === id);

        if (result == null) {
            LogMgr.Warn(`ConfigMgr getConfigById id ${id} not found in ${UIName}`);
            return null;
        }

        const configDataObj = new ConfigData();
        configDataObj.buttonNodeName = result.buttonNodeName;
        configDataObj.eventMainType = this.parseEnumValue(result.eventMainType, 'EventType', EventType) as EventType;
        configDataObj.eventSubType = this.parseEnumValue(result.eventSubType, 'UIType', UIType) as UIType;
        configDataObj.eventSubType = this.parseEnumValue(result.eventSubType, 'WSType', WSType) as WSType;
        configDataObj.payload = result.payload;
        configDataObj.targetUI = result.targetUI;
        configDataObj.canMultiOpen = result.canMultiOpen;

        return configDataObj;
    }

    //加载并缓存bundle中的配置文件
    async loadConfig() {
        await this.getUIConfigData();
    }

    private async getUIConfigData(): Promise<any | null> {
        if (this.uiConfigCache != null) {
            return this.uiConfigCache;
        }

        const config = (await ResMgr.Instance.GetAsset(Bundle.Config, Config.UIConfig, JsonAsset)) as JsonAsset;
        if (config == null) {
            LogMgr.Warn('ConfigMgr getUIConfigData config is null');
            return null;
        }

        this.uiConfigCache = config.json;
        return this.uiConfigCache;
    }

    // 把字符串转成Constant的底层number。
    private parseEnumValue(rawValue: unknown, enumName: string, enumObj: any): number {
        if (typeof rawValue === 'number') {
            return rawValue;
        }

        if (typeof rawValue !== 'string') {
            LogMgr.Warn(`ConfigMgr parseEnumValue invalid value for ${enumName}: ${rawValue}`);
            return 0;
        }

        const value = rawValue.trim();
        let memberName = value;

        if (value.includes('.')) {
            const [typeName, key] = value.split('.');
            if (typeName !== enumName) {
                LogMgr.Warn(`ConfigMgr parseEnumValue enum name mismatch, expect ${enumName}, got ${typeName}`);
                return 0;
            }
            memberName = key;
        }

        if (value === enumName) {
            const firstEnumKey = Object.keys(enumObj).find((key) => {
                return Number.isNaN(Number(key)) && typeof enumObj[key] === 'number';
            });
            if (firstEnumKey != null) {
                return enumObj[firstEnumKey] as number;
            }
            LogMgr.Warn(`ConfigMgr parseEnumValue ${enumName} has no numeric members`);
            return 0;
        }

        const enumValue = enumObj[memberName];
        if (typeof enumValue === 'number') {
            return enumValue;
        }

        LogMgr.Warn(`ConfigMgr parseEnumValue invalid enum member: ${value}`);
        return 0;
    }
}

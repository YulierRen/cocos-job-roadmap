import {_decorator, Component, Node} from 'cc';

export enum Bundle {
    Gui = 'GUI',
    Config = 'CONFIG'
}

export enum Config {
    UIConfig = 'ui_config',
    BagItemConfig = 'bag_item_config'
}

export enum Gui {
    MainUI = 'MainUI',
    PopupUI = 'PopupUI'
}

export enum EventType {
    UI,
    WS,
    FlushBagPanel,
    UIEvent
}

export enum UIType {
    //通用
    OpenPopup,
    ClosePopup,
    SendTips,

    //背包
    FlushBagPanel,
    OpenBagPanel
}

export enum WSType {
    Connect
}

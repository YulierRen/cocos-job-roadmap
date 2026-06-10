import {_decorator, Component, Node} from 'cc';

export enum ItemType {
    Consumable = 1, // 消耗品
    Equipment = 2, // 装备
    Material = 3, // 材料
    Quest = 4 // 任务物品
}

export interface ItemConfig {
    id: number;
    name: string;
    icon: string;
    type: ItemType;
    quality: number;
    maxStack: number;
    desc: string;
}

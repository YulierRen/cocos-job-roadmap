import {_decorator, Component, Node} from 'cc';

export interface BagSlotData {
    slotIndex: number; // 格子索引
    itemId: number; // 物品ID，0 表示空
    count: number; // 数量
    isNew: boolean; // 是否新获得的物品
}
export interface BagSaveData {
    version: number;
    capacity: number;
    slots: BagSlotData[];
}

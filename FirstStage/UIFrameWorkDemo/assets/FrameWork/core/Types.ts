import {_decorator, Component, Node} from 'cc';

export interface UIOpenParams {
    uiName: string;
    payload?: string;
    source?: string;
    timestamp: number;
    canMultiOpen?: boolean;
}

export class Types extends Component {}

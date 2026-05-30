/** @format */

import {_decorator, Component, Node} from 'cc';

export interface IState<TOwner> {
    name: string;
    onEnter(owner: TOwner, args?: any): void;
    onUpdate(owner: TOwner, dt: number): void;
    onExit(owner: TOwner): void;
}

export class FSM<TOwner> {
    private owner: TOwner;
    private states = new Map<string, IState<TOwner>>();
    private current?: IState<TOwner>;

    constructor(owner: TOwner) {
        this.owner = owner;
    }

    add(state: IState<TOwner>) {
        this.states.set(state.name, state);
        return this;
    }

    change(name: string, args?: any) {
        const next = this.states.get(name);
        if (!next) throw new Error(`State not found: ${name}`);

        this.current?.onExit(this.owner);
        this.current = next;
        this.current.onEnter(this.owner, args);
    }

    update(dt: number) {
        this.current?.onUpdate(this.owner, dt);
    }

    getstateName() {
        return this.current?.name ?? 'None';
    }
}

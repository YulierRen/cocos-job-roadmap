import {_decorator, Component, Node} from 'cc';
import {MainUI} from '../../Game/scripts/ui/MainUI';
import {PopupUI} from '../../Game/scripts/ui/PopupUI';
import {TipsUI} from '../../Game/scripts/ui/TipsUI';
import {BagPanel} from '../../Game/scripts/Bag/controller/BagPanel';
import {BagItemCell} from '../../Game/scripts/Bag/controller/BagItemCell';
import {ItemDetailPanel} from '../../Game/scripts/Bag/controller/ItemDetailPanel';
import {TaskPanel} from '../../Game/scripts/Task/controller/TaskPanel';
import {TaskItemCell} from '../../Game/scripts/Task/controller/TaskItemCell';
const {ccclass, property} = _decorator;

type Ctor<T> = new (...args: any[]) => T;

export class Registry extends Component {
    public static Instance: Registry = null;

    protected onLoad(): void {
        if (Registry.Instance === null) {
            Registry.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }
    private map = new Map<string, Ctor<Component>>();

    register(name: string, ctor: Ctor<Component>) {
        this.map.set(name, ctor);
    }

    get(name: string) {
        return this.map.get(name);
    }

    Init() {
        Registry.Instance.register('MainUI', MainUI);
        Registry.Instance.register('PopupUI', PopupUI);
        Registry.Instance.register('TipsUI', TipsUI);

        Registry.Instance.register('BagPanel', BagPanel);
        Registry.Instance.register('BagItemCell', BagItemCell);
        Registry.Instance.register('ItemDetailPanel', ItemDetailPanel);

        Registry.Instance.register('TaskPanel', TaskPanel);
        Registry.Instance.register('TaskItemCell', TaskItemCell);
    }
}

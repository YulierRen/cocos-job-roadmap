import {_decorator, Component, Node} from 'cc';
import {TaskManager} from '../model/TaskManager';
import {ResMgr} from 'db://assets/FrameWork/core/ResMgr';
import {Bundle} from '../../constant/constant';
import {UIFactory} from 'db://assets/FrameWork/core/UIFactory';
import {TaskItemCell} from './TaskItemCell';

export class TaskPanel extends Component {
    private taskItemCells: Node[] = [];

    private scrollContent: Node = null;

    protected onLoad(): void {
        this.scrollContent = this.node.getChildByPath('TaskScroll/View/content');
    }

    async Init() {
        console.log('任务面板初始化');
        const tasks = await TaskManager.Instance.GetAllTasks();
        tasks.forEach(async (task) => {
            const taskNode = await UIFactory.Instance.CreateUI('TaskItemCell');
            taskNode.getComponent(TaskItemCell).Init(task.taskId);
            console.log(this.scrollContent);
            this.scrollContent.addChild(taskNode);
            this.taskItemCells.push(taskNode);
        });
    }
}

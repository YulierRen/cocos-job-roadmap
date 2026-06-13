import {_decorator, Component, Label, Node} from 'cc';
import {TaskDB} from '../Data/TaskDB';
import {TaskManager} from '../model/TaskManager';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';

export class TaskItemCell extends Component {
    private taskId: number = 0;

    protected onLoad(): void {
        this.node.getChildByName('AddProgress').on('click', this.OnAddProgressClicked, this);
        this.node.getChildByName('ClaimReward').on('click', this.OnClaimRewardClicked, this);
    }

    Init(taskId: number) {
        this.taskId = taskId;
        console.log(`TaskItemCell Init with taskId: ${taskId}`);
        this.FlushTaskContent();
        this.Flush();

        EventBus.Instance.AddEventListener(EventType.UI, this.OnUIEventProgress, this);
    }

    OnAddProgressClicked() {
        console.log(`Adding progress to task ${this.taskId}`);
        TaskManager.Instance.AddProgress(this.taskId, 1);
    }

    OnClaimRewardClicked() {
        console.log(`Claiming reward for task ${this.taskId}`);
        TaskManager.Instance.ClaimReward(this.taskId);
    }

    async FlushTaskContent() {
        const taskConfig = await TaskDB.Instance.GetTaskConfigById(this.taskId);
        this.node.getChildByName('TaskName').getComponent(Label).string = taskConfig.name;
        this.node.getChildByName('TaskContent').getComponent(Label).string = taskConfig.desc;
    }

    async Flush() {
        if (TaskManager.Instance.GetTaskData(this.taskId) == null) {
            this.node.getChildByName('TaskName').getComponent(Label).string = '任务已完成';
            this.node.getChildByName('TaskContent').getComponent(Label).string = '';
            return;
        }
        const taskConfig = await TaskDB.Instance.GetTaskConfigById(this.taskId);
        const taskData = TaskManager.Instance.GetTaskData(this.taskId);
        const progressValue = (taskData.progress / taskConfig.targetValue) * 100;
        this.node.getChildByName('progress').getComponent(Label).string = `${progressValue.toFixed(2)}%`;
    }

    async OnUIEventProgress(mainType: number, subType: number, data: any) {
        switch (subType) {
            case UIType.FlushTaskPanel:
                this.Flush();
                break;
                break;
            default:
                break;
        }
    }
}

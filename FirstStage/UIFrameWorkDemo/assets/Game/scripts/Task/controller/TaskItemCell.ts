import {_decorator, Component, Label, Node} from 'cc';
import {TaskDB} from '../Data/TaskDB';
import {TaskManager} from '../model/TaskManager';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';
import {TaskState} from '../config/TaskState';
import {TaskData} from '../config/TaskData';

export class TaskItemCell extends Component {
    private taskId: number = 0;
    private stateLabel: Label = null;

    protected onLoad(): void {
        this.node.getChildByName('AddProgress').on('click', this.OnAddProgressClicked, this);
        this.node.getChildByName('ClaimReward').on('click', this.OnClaimRewardClicked, this);
        this.stateLabel = this.node.getChildByName('State').getComponent(Label);
    }
    protected onDestroy(): void {
        EventBus.Instance.RemoveEventListener(EventType.UI, this.OnUIEventProgress, this);
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
            this.node.removeFromParent();
            return;
        }

        const taskConfig = await TaskDB.Instance.GetTaskConfigById(this.taskId);
        const taskData = TaskManager.Instance.GetTaskData(this.taskId);
        this.SwitchState(taskData);
        const progressValue = (taskData.progress / taskConfig.targetValue) * 100;
        this.node.getChildByName('progress').getComponent(Label).string = `${progressValue.toFixed(2)}%`;
    }

    SwitchState(taskData: TaskData) {
        switch (taskData.state) {
            case TaskState.Accepted:
                this.stateLabel.string = '进行中';
                break;
            case TaskState.Completed:
                this.stateLabel.string = '已完成';
                break;
            case TaskState.Rewarded:
                this.stateLabel.string = '已领取';
                break;
            default:
                this.stateLabel.string = '未知状态';
                break;
        }
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

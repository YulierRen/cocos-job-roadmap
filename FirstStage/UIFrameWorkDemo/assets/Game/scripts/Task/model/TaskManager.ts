import {_decorator, Component, Node} from 'cc';
import {TaskDB} from '../Data/TaskDB';
import {TaskConfig} from '../config/TaskConfig';
import {TaskData} from '../config/TaskData';
import {TaskState} from '../config/TaskState';
import {BagManager} from '../../Bag/model/BagManager';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';

export class TaskManager extends Component {
    public static Instance: TaskManager = null;

    private taskMap: Map<number, TaskData> = new Map();

    protected onLoad(): void {
        if (TaskManager.Instance === null) {
            TaskManager.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    async Init() {
        console.log('TaskManager Init');
        this.node.addComponent(TaskDB).Init();

        const taskConfigs = await TaskDB.Instance.GetAllConfigAndCache();
        taskConfigs.forEach((config) => {
            this.AcceptTask(config.id);
        });
    }
    async AcceptTask(taskId) {
        if (this.taskMap.has(taskId)) {
            console.warn(`Task ${taskId} has already been accepted.`);
            return;
        }
        const taskConfig = await TaskDB.Instance.GetTaskConfigById(taskId);
        if (!taskConfig) {
            console.warn(`Task ${taskId} does not exist.`);
            return;
        }
        const taskData: TaskData = {
            taskId: taskConfig.id,
            progress: 0,
            state: TaskState.Accepted
        };
        this.taskMap.set(taskId, taskData);
    }
    async AddProgress(taskId, value) {
        if (!this.taskMap.has(taskId)) {
            console.warn(`Task ${taskId} has not been accepted.`);
            return;
        }
        const taskData = this.taskMap.get(taskId);
        const taskConfig = await TaskDB.Instance.GetTaskConfigById(taskId);
        taskData.progress += value;
        if (taskData.progress >= taskConfig.targetValue) {
            taskData.state = TaskState.Completed;
        }
        this.FlushTaskData();
    }
    async ClaimReward(taskId) {
        const taskData = this.taskMap.get(taskId);
        const taskConfig = await TaskDB.Instance.GetTaskConfigById(taskId);

        if (!this.taskMap.has(taskId)) {
            console.warn(`Task ${taskId} has not been accepted.`);
            return;
        }

        if (taskData.progress < taskConfig.targetValue) {
            console.warn(`Task ${taskId} is not completed yet.`);
            return;
        }
        if (taskData.state === TaskState.Rewarded) {
            console.warn(`Task ${taskId} reward has already been claimed.`);
            return;
        }

        //发放奖励
        taskData.state = TaskState.Rewarded;

        BagManager.Instance.AddItem(taskConfig.rewardItemId, taskConfig.rewardCount);

        this.taskMap.delete(taskId);
    }

    GetAllTasks(): TaskData[] {
        return Array.from(this.taskMap.values());
    }
    GetTaskData(taskId): TaskData {
        return this.taskMap.get(taskId);
    }

    FlushTaskData() {
        EventBus.Instance.Emit(EventType.UI, UIType.FlushTaskPanel, null);
    }
}

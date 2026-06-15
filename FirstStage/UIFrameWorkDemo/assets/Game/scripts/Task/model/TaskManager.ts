import {_decorator, Component, Node} from 'cc';
import {TaskDB} from '../Data/TaskDB';
import {TaskConfig} from '../config/TaskConfig';
import {TaskData} from '../config/TaskData';
import {TaskState} from '../config/TaskState';
import {BagManager} from '../../Bag/model/BagManager';
import {EventBus} from 'db://assets/FrameWork/core/EventBus';
import {EventType, UIType} from '../../constant/constant';
import {UIOpenParams} from 'db://assets/FrameWork/core/Types';

const presentation: UIOpenParams = {
    uiName: 'TipsUI',
    payload: '',
    timestamp: Date.now(),
    canMultiOpen: true
};

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
        this.node.addComponent(TaskDB);
        await TaskDB.Instance.Init();

        const taskConfigs = await TaskDB.Instance.GetAllConfigs();
        taskConfigs.forEach((config) => {
            this.AcceptTask(config.id);
        });
    }
    async AcceptTask(taskId) {
        if (this.taskMap.has(taskId)) {
            this.SendTips(`任务 ${taskId} 已经被接受`);
            return;
        }
        const taskConfig = await TaskDB.Instance.GetTaskConfigById(taskId);
        if (!taskConfig) {
            this.SendTips(`任务配置 ${taskId} 不存在`);
            return;
        }
        const taskData: TaskData = {
            taskId: taskConfig.id,
            progress: 0,
            state: TaskState.Accepted
        };
        this.taskMap.set(taskId, taskData);
        this.FlushTaskData();
    }
    async AddProgress(taskId, value) {
        if (!this.taskMap.has(taskId)) {
            this.SendTips(`任务 ${taskId} 尚未被接受`);
            return;
        }
        const taskData = this.taskMap.get(taskId);
        const taskConfig = await TaskDB.Instance.GetTaskConfigById(taskId);
        taskData.progress += value;
        if (taskData.progress > taskConfig.targetValue) {
            taskData.progress = taskConfig.targetValue;
        }
        if (taskData.state === TaskState.Completed) {
            this.SendTips(`任务 ${taskId} 已经完成，快去领取奖励吧！`);
            return;
        }
        if (taskData.progress >= taskConfig.targetValue) {
            taskData.state = TaskState.Completed;
            this.SendTips(`任务 ${taskId} 已经完成，快去领取奖励吧！`);
        }
        this.FlushTaskData();
    }
    async ClaimReward(taskId: number) {
        const taskData = this.taskMap.get(taskId);
        if (taskData == null) {
            this.SendTips(`任务 ${taskId} 尚未被接受`);
            return;
        }

        const taskConfig = await TaskDB.Instance.GetTaskConfigById(taskId);
        if (taskConfig == null) {
            console.error(`任务配置 ${taskId} 不存在`);
            return;
        }

        if (taskData.progress < taskConfig.targetValue) {
            this.SendTips(`任务 ${taskId} 尚未完成`);
            return;
        }
        if (taskData.state === TaskState.Rewarded) {
            this.SendTips(`任务 ${taskId} 奖励已经领取`);
            return;
        }

        //发放奖励
        taskData.state = TaskState.Rewarded;

        BagManager.Instance.AddItem(taskConfig.rewardItemId, taskConfig.rewardCount);
        this.SendTips(`任务 ${taskId} 奖励已领取：${taskConfig.rewardCount} 个 ${taskConfig.name}`);

        this.FlushTaskData();
    }

    removeTask(taskId) {
        if (!this.taskMap.has(taskId)) {
            this.SendTips(`任务 ${taskId} 尚未被接受`);
            return;
        }
        if (this.taskMap.get(taskId).state !== TaskState.Accepted) {
            this.SendTips(`任务 ${taskId} 不能被移除`);
            return;
        }
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

    SendTips(message: string) {
        presentation.payload = message;
        EventBus.Instance.Emit(EventType.UI, UIType.SendTips, presentation);
    }
}

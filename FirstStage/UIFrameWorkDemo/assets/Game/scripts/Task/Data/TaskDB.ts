import {Component, JsonAsset} from 'cc';
import {ResMgr} from 'db://assets/FrameWork/core/ResMgr';
import {Bundle, Config} from '../../constant/constant';
import {TaskConfig} from '../config/TaskConfig';

export class TaskDB extends Component {
    public static Instance: TaskDB = null;

    private taskConfigCache: Map<number, TaskConfig> = new Map();
    /** 加载门闩：确保 Init() 被多次调用时配置只从磁盘加载一次 */
    private initPromise: Promise<void> | null = null;

    protected onLoad() {
        if (TaskDB.Instance === null) {
            TaskDB.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    /**
     * 初始化：加载并缓存全部任务配置。
     * 可被多次调用，内部通过 initPromise 保证只加载一次。
     */
    async Init(): Promise<void> {
        if (this.initPromise !== null) {
            return this.initPromise;
        }

        console.log('TaskDB Init');
        this.initPromise = this.loadConfigs();
        return this.initPromise;
    }

    /** 从磁盘读取配置表并填充缓存（仅内部调用） */
    private async loadConfigs(): Promise<void> {
        const taskJson = (await ResMgr.Instance.GetAsset(Bundle.Config, Config.TaskConfig, JsonAsset)) as JsonAsset;
        taskJson.json.forEach((item: TaskConfig) => {
            this.taskConfigCache.set(item.id, item);
        });
    }

    /** 获取全部任务配置（纯读缓存） */
    async GetAllConfigs(): Promise<TaskConfig[]> {
        return Array.from(this.taskConfigCache.values());
    }

    /** 按 ID 获取单条任务配置（纯读缓存） */
    async GetTaskConfigById(taskId: number): Promise<TaskConfig | null> {
        return this.taskConfigCache.get(taskId) ?? null;
    }
}

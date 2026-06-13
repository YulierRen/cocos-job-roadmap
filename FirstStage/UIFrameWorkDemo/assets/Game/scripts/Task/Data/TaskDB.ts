import {Component, JsonAsset} from 'cc';
import {ResMgr} from 'db://assets/FrameWork/core/ResMgr';
import {Bundle, Config} from '../../constant/constant';
import {TaskConfig} from '../config/TaskConfig';

export class TaskDB extends Component {
    public static Instance: TaskDB = null;

    private taskConfigCache: Map<number, TaskConfig> = new Map();

    protected onLoad() {
        if (TaskDB.Instance === null) {
            TaskDB.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    Init() {
        console.log('TaskDB Init');
        this.GetAllConfigAndCache();
    }
    async GetAllConfigAndCache(): Promise<TaskConfig[]> {
        const taskJson = (await ResMgr.Instance.GetAsset(Bundle.Config, Config.TaskConfig, JsonAsset)) as JsonAsset;
        taskJson.json.filter((item) => {
            this.taskConfigCache.set(item.id, item);
        });
        return Array.from(this.taskConfigCache.values());
    }
    async GetAllConfig(): Promise<TaskConfig[]> {
        return Array.from(this.taskConfigCache.values());
    }
    async GetTaskConfigById(taskId): Promise<TaskConfig> {
        if (this.taskConfigCache.has(taskId)) {
            return this.taskConfigCache.get(taskId);
        }
        return null;
    }
}

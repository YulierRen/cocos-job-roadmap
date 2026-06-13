import {TaskState} from './TaskState';

export interface TaskData {
    taskId: number;
    progress: number;
    state: TaskState;
}

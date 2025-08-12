import { TTaskType } from "src/model/entities/task";

export interface ICompletion {
    user: ICompletionUser;
    progress: number;
    tasks: ICompletionTask[];
}

export interface ICompletionTask {
    task_id: number;
    task_type: TTaskType;
    completed: boolean;
}

export interface ICompletionUser {
    id: number;
    email: string;
    name: string;
    wallet: string;
}

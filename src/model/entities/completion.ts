import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CTask } from "./task";
import { CUser } from "./user";

// сущность хранит факты выполнения заданий юзерами (для отображения прогресса)
@Entity({name: "a7_completions"})
export class CCompletion {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable: false})
    public user_id: number;

    @Column({nullable: false})
    public task_id: number;

    ///////////////
    // relations
    ///////////////

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CTask, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "task_id"})
    public task: CTask;
}
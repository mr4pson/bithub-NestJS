import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CUser } from "./user";
import { CProblem } from "./problem";

// сущность хранит время просмотра задач юзерами
// используется для определения наличия новых каментов (если есть каменты позднее последнего захода, то считаем их непросмотренными)
@Entity({name: "a7_problem_viewings"})
export class CProblemViewing {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable: false})
    public user_id: number;

    @Column({nullable: false})
    public problem_id: number;

    @Column({nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP()"})
    public viewed_at: Date;

    ///////////////
    // relations
    ///////////////

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CProblem, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "problem_id"})
    public problem: CProblem; 
}
import { Column, CreateDateColumn, Entity, Generated, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";
import { CDesk } from "./desk";
import { CGuide } from "./guide";
import { CTask } from "./task";
import { CProblemComment } from "./problem.comment";
import { CProblemViewing } from "./problem.viewing";

@Entity({name: "a7_problems"})
export class CProblem extends CEntity {
    @Column({nullable: true, default: null})
    public desk_id: number;

    @Column({nullable: true, default: null})
    public user_id: number; // исполнитель 

    @Column({nullable: true, default: null})
    public guide_id: number;

    @Column({nullable: true, default: null})
    public task_id: number;

    @Column({nullable: true, default: null, type: "text"})
    public content: string;

    @Column({nullable: true, default: null, type: "date"})
    public actual_until: string;

    @Index()
    @CreateDateColumn({nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"}) 
    public created_at: Date;   

    ////////////////
    // relations
    ////////////////

    @ManyToOne(type => CDesk, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "desk_id"})
    public desk: CDesk;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CGuide, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "guide_id"})
    public guide: CGuide;

    @ManyToOne(type => CTask, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "task_id"})
    public task: CTask;

    @OneToMany(type => CProblemComment, comment => comment.problem, {cascade: false})
    public comments: CProblemComment[];

    @OneToMany(type => CProblemViewing, viewing => viewing.problem, {cascade: false})
    public viewings: CProblemViewing[];
}
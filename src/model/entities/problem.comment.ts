import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";
import { CProblem } from "./problem";

@Entity({name: "a7_problem_comments"})
export class CProblemComment extends CEntity {
    @Column({nullable: true, default: null})
    public problem_id: number;

    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null, type: "text"}) 
    public content: string;

    @Index()
    @CreateDateColumn({nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"}) 
    public created_at: Date; 

    ///////////////////
    // relations
    ///////////////////

    @ManyToOne(type => CProblem, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "problem_id"})
    public problem: CProblem;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;    
}
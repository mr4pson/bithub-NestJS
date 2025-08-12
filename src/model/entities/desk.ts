import { Column, Entity, Generated, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";
import { CProblem } from "./problem";

export type TDeskMode = "public" | "private";

@Entity({name: "a7_desks"})
export class CDesk extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({type: "enum", enum: ["public", "private"], nullable: false, default: "public"}) // public - общее пространство для супер-юзера и суб-юзеров, private - личное для любого юзера
    public mode: TDeskMode;

    @Column({nullable: true, default: null})
    public name: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    ////////////////
    // relations
    ////////////////

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @OneToMany(type => CProblem, problem => problem.desk, {cascade: false})
    public problems: CProblem[];
}

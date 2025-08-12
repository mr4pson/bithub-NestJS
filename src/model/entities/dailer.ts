import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";

// ежедневные задания
@Entity({name: "a7_dailers"})
export class CDailer extends CEntity {
    @Column({nullable: false})
    public user_id: number;

    @Column({nullable: true, default: null})
    public name: string;

    @Column({nullable: true, default: null})
    public link: string;

    @Column({nullable: true, default: null, type: "text"})
    public comment: string;

    @Column({nullable: false, default: false})
    public completed: boolean;

    ///////////////
    // relations
    ///////////////

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;
}
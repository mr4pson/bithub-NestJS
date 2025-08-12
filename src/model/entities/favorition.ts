import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CUser } from "./user";
import { CGuide } from "./guide";

// эта сущность хранит факты внесения гайдов в избранное пользователей
@Entity({name: "a7_favoritions"})
export class CFavorition {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable: false})
    public user_id: number;

    @Column({nullable: false})
    public guide_id: number;

    ///////////////
    // relations
    ///////////////

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CGuide, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "guide_id"})
    public guide: CGuide;
}
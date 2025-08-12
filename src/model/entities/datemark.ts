import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CUser } from "./user";
import { CGuide } from "./guide";

@Entity({name: "a7_datemarks"})
export class CDatemark {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable: false})
    public user_id: number;

    @Column({nullable: false})
    public guide_id: number;

    @Index()
    @Column({type: "enum", enum: ["reminder", "execution"], nullable: false, default: "reminder"})
    public type: TDatemarkType;

    @Index()
    @Column({nullable: false, type: "date"})
    public date: string;

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

export type TDatemarkType = "reminder" | "execution";

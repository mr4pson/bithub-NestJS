import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CGuide } from "./guide";
import { CUser } from "./user";

@Entity({name: "a7_guide_notes"})
export class CGuideNote extends CEntity {
    @Column({nullable: true, default: null})
    public guide_id: number;

    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null, type: "text"})
    public content: string;

    // relations
    @ManyToOne(type => CGuide, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "guide_id"})
    public guide: CGuide;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;
}
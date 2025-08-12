import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CGuide } from "./guide";
import { CUser } from "./user";

@Entity({name: "a7_comments"})
export class CComment extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: false})
    public guide_id: number;

    @Column({nullable: false, default: false})
    public is_admin: boolean;

    @Column({type: "text", nullable: true, default: null})
    public content: string;

    @Column({nullable: false, default: false})
    public active: boolean;

    @Index()
    @CreateDateColumn({nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date;

    ////////////////
    // relations
    ////////////////

    @ManyToOne(type => CGuide, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "guide_id"})
    public guide: CGuide;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;
}
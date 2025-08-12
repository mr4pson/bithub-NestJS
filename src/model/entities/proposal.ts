import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";

export type TProposalStatus = "created" | "accepted" | "rejected";

@Entity({name: "a7_proposals"})
export class CProposal extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null, type: "text"})
    public content: string;

    @Index()
    @Column({type: "enum", enum: ["created", "accepted", "rejected"], nullable: false, default: "created"})
    public status: TProposalStatus;

    @Index()
    @CreateDateColumn({nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"}) 
    public created_at: Date;   

    ////////////////
    // relations
    ////////////////

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "user_id"})
    public user: CUser;
}
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CShopitem } from "./shopitem";

@Entity({name: "a7_shoporders"})
export class CShoporder extends CEntity {
    @Column({nullable: false})
    public shopitem_id: number;

    @Index()
    @Column({nullable: false})
    public email: string;

    @Index()
    @Column({nullable: true, default: null})
    public tg: string;

    @Column({type: "text", nullable: true, default: null})
    public comment: string;

    @Column({type: "enum", enum: ["created", "completed", "rejected"], nullable: false, default: "created"})
    public status: TShoporderStatus;

    @Index()
    @CreateDateColumn({nullable: false, type: "timestamp"})
    public created_at: Date;

    ////////////////
    // relations
    ////////////////

    @ManyToOne(type => CShopitem, {onDelete: "RESTRICT", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "shopitem_id"})
    public shopitem: CShopitem;
}

export type TShoporderStatus = "created" | "completed" | "rejected";

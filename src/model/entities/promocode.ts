import { Column, CreateDateColumn, Entity, Index } from "typeorm";
import { CEntity } from "./_entity";

export type TPromocodeLimit = "activation" | "date"; // лимит количества активаций или лимит срока действия

@Entity({name: "a7_promocodes"})
export class CPromocode extends CEntity {
    @Column({nullable: true, default: null, unique: true})
    public code: string;

    @Column({nullable: false, default: 0})
    public discount: number;

    @Column({type: "enum", enum: ["activation", "date"], nullable: false, default: "activation"})
    public limit: TPromocodeLimit;

    @Column({nullable: true, default: null})
    public activation_limit: number;

    @Column({nullable: true, default: null, type: "timestamp"})
    public date_limit: Date;

    @Index()
    @CreateDateColumn({type: "timestamp"}) 
    public created_at: Date;
}
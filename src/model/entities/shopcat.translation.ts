import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CShopcat } from "./shopcat";

@Entity({name: "a7_shopcat_translations"})
export class CShopcatTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public shopcat_id: number;

    @Column({nullable: true, default: null})
    public name: string;

    // relations
    @ManyToOne(type => CShopcat, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "shopcat_id"})
    public shopcat: CShopcat;
}

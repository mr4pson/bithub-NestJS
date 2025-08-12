import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CShopitem } from "./shopitem";

@Entity({name: "a7_shopitem_translations"})
export class CShopitemTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public shopitem_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public name: string;

    @Column({type: "longtext", nullable: true, default: null})
    public content: string;

    @Column({type: "text", nullable: true, default: null})
    public contentshort: string;

    ///////////////
    // relations
    ///////////////

    @ManyToOne(type => CShopitem, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "shopitem_id"})
    public shopitem: CShopitem;
}

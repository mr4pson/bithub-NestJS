import { Column, Entity, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CShopcatTranslation } from "./shopcat.translation";

@Entity({name: "a7_shopcats"})
export class CShopcat extends CEntity {
    @Column({nullable: false, default: 0})
    public pos: number;

    // relations
    @OneToMany(type => CShopcatTranslation, translation => translation.shopcat, {cascade: true})
    public translations: CShopcatTranslation[];
}

import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CCat } from "./cat";

@Entity({name: "a7_cat_translations"})
export class CCatTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public cat_id: number;

    @Column({nullable: true, default: null})
    public name: string;    

    // relations
    @ManyToOne(type => CCat, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "cat_id"})
    public cat: CCat;
}

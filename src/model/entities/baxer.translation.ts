import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CBaxer } from "./baxer";

@Entity({name: "a7_baxer_translations"})
export class CBaxerTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public baxer_id: number;

    @Column({nullable: true, default: null})
    public link: string;    

    @Column({nullable: true, default: null})
    public img: string;    

    // relations
    @ManyToOne(type => CBaxer, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "baxer_id"})
    public baxer: CBaxer;
}

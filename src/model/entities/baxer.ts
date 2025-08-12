import { Column, Entity, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CBaxerTranslation } from "./baxer.translation";

@Entity({name: "a7_baxers"})
export class CBaxer extends CEntity {
    @Column({nullable: true, default: null})
    public name: string;
    
    @Column({nullable: false, default: 0})
    public pos: number;

    @Column({nullable: false, default: true})
    public active: boolean;

    // relations
    @OneToMany(type => CBaxerTranslation, translation => translation.baxer, {cascade: true})
    public translations: CBaxerTranslation[];    
}

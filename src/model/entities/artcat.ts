import { Column, Entity, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CArtcatTranslation } from "./artcat.translation";

@Entity({name: "a7_artcats"})
export class CArtcat extends CEntity {    
    @Column({nullable: false, default: 0})
    public pos: number;
    
    // relations
    @OneToMany(type => CArtcatTranslation, translation => translation.artcat, {cascade: true})
    public translations: CArtcatTranslation[];    
}

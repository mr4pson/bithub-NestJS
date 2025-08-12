import { Column, Entity, OneToMany } from "typeorm";
import { CMailtemplateTranslation } from "./mailtemplate.translation";
import { CEntity } from "./_entity";

@Entity({name: "a7_mailtemplates"})
export class CMailtemplate extends CEntity {
    @Column({nullable: false, unique: true})
    public name: string;

    // relations
    @OneToMany(type => CMailtemplateTranslation, translation => translation.mailtemplate, {cascade: true})
    public translations: CMailtemplateTranslation[];
}

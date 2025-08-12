import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CMailtemplate } from "./mailtemplate";
import { CEntityTranslation } from "./_entity.translation";

@Entity({name: "a7_mailtemplate_translations"})
export class CMailtemplateTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public mailtemplate_id: number;

    @Column({nullable: true, default: null})
    public subject: string;
    
    @Column({type: "text", nullable: true, default: null})
    public content: string;    

    // relations
    @ManyToOne(type => CMailtemplate, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "mailtemplate_id"})
    public mailtemplate: CMailtemplate;
}

import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CArtcat } from "./artcat";

@Entity({name: "a7_artcat_translations"})
export class CArtcatTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public artcat_id: number;

    @Column({nullable: true, default: null})
    public name: string;    

    // relations
    @ManyToOne(type => CArtcat, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "artcat_id"})
    public artcat: CArtcat;
}

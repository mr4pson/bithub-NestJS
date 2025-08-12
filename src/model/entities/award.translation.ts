import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CAward } from "./award";

@Entity({name: "a7_award_translations"})
export class CAwardTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public award_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public name: string;    

    ///////////////
    // relations
    ///////////////

    @ManyToOne(type => CAward, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "award_id"})
    public award: CAward;
}

import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CGuide } from "./guide";

@Entity({name: "a7_guide_translations"})
export class CGuideTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public guide_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public name: string;

    @Column({type: "longtext", nullable: true, default: null, select: false}) // select: false - for optimization purposes (decrease memory usage in stats queries)
    public content: string;

    @Column({type: "text", nullable: true, default: null, select: false})  // select: false - for optimization purposes (decrease memory usage in stats queries)
    public contentshort: string;

    /*
    @Index()
    @Column({nullable: true, default: null})
    public earnings: string;
    */

    // relations
    @ManyToOne(type => CGuide, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "guide_id"})
    public guide: CGuide;
}

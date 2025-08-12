import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CGuide } from "./guide";
import { CEntity } from "./_entity";
import { CLinktype } from "./linktype";

@Entity({name: "a7_guide_links"})
export class CGuideLink extends CEntity {
    @Column({nullable: true, default: null})
    public guide_id: number;

    @Column({nullable: true, default: null})
    public linktype_id: number;
    
    @Column({nullable: true, default: null})
    public value: string; 

    @Column({nullable: false, default: 0})
    public pos: number;
    
    // relations
    @ManyToOne(type => CGuide, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "guide_id"})
    public guide: CGuide;

    @ManyToOne(type => CLinktype, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "linktype_id"})
    public type: CLinktype;
}

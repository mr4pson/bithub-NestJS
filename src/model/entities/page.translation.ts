import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CPage } from "./page";
import { CEntityTranslation } from "./_entity.translation";

@Entity({name: "a7_page_translations"})
export class CPageTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public page_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public name: string;
    
    @Column({type: "longtext", nullable: true, default: null})
    public content: string;

    @Column({nullable: true, default: null})
    public title: string;

    @Column({type: "text", nullable: true, default: null})
    public description: string;

    @Column({nullable: true, default: null})
    public h1: string;

    // relations
    @ManyToOne(type => CPage, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "page_id"})
    public page: CPage;
}
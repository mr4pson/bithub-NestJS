import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CPageTranslation } from "./page.translation";
import { CEntity } from "./_entity";
import { IChildable } from "../childable.interface";
import { IImagable } from "../imagable.interface";

@Entity({name: "a7_pages"})
export class CPage extends CEntity implements IChildable, IImagable {
    @Column({nullable: true, default: null})
    public parent_id: number;

    @Column({nullable: false, unique: true})
    public slug: string;

    @Column({nullable: true, default: null})
    public img: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Column({nullable: false, default: true})
    public active: boolean;

    @Column({nullable: false, default: true})
    public menumain: boolean;

    @Column({nullable: false, default: true})
    public menufoot: boolean;

    // relations
    @OneToMany(type => CPageTranslation, translation => translation.page, {cascade: true})
    public translations: CPageTranslation[];

    @OneToMany(type => CPage, child => child.parent, {cascade: false})
    public children: CPage[];

    @ManyToOne(type => CPage, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "parent_id"})
    public parent: CPage;   
    
    // helpers
    public __shift: string = "";
    public __level: number = 0;
}

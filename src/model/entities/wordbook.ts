import { Column, Entity, OneToMany, Index } from "typeorm";
import { CWord } from "./word";
import { CEntity } from "./_entity";

@Entity({name: "a7_wordbooks"}) 
export class CWordbook extends CEntity {
    @Index()
    @Column({nullable: true, default: null})
    name: string;

    @Column({nullable: false, default: 0})
    pos: number;  

    @Index()
    @Column({nullable: false, default: "all"})
    load_to: string;
       
    // relations
    @OneToMany(type => CWord, word => word.wordbook, {cascade: true})
    words: CWord[];
}

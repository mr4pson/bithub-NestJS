import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CWordTranslation } from "./word.translation";
import { CWordbook } from "./wordbook";
import { CEntity } from "./_entity";

@Entity({name: "a7_words"}) 
export class CWord extends CEntity {
    @Column({nullable: true, default: null}) // can be null because we use cascade updating in wordbook
    public wordbook_id: number;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Index()
    @Column({nullable: true, default: null})
    public mark: string;

    @Column({nullable: true, default: null})
    public note: string;

    // relations
    @ManyToOne(type => CWordbook, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "wordbook_id"})
    public wordbook: CWordbook;

    @OneToMany(type => CWordTranslation, translation => translation.word, {cascade: true})
    public translations: CWordTranslation[];
}
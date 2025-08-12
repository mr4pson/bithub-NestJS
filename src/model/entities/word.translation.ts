import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CWord } from "./word";
import { CEntityTranslation } from "./_entity.translation";

@Entity({name: "a7_word_translations"})
export class CWordTranslation extends CEntityTranslation {
    @Column({nullable: false})
    word_id: number;

    @Column({type: "text", nullable: true, default: null})
    text: string;

    // relations
    @ManyToOne(type => CWord, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "word_id"})
    word: CWord;
}

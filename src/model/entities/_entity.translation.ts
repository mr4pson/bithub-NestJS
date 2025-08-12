import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CLang } from "./lang";

export abstract class CEntityTranslation {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable: false})
    public lang_id: number;

    // relations
    @ManyToOne(type => CLang, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "lang_id"})
    lang: CLang;
}
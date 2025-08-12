import { Column, Entity, Index } from "typeorm";
import { CEntity } from "./_entity";
import { IImagable } from "../imagable.interface";

// [mm/dd/yyyy], [Month dd, yyyy]
// [dd.mm.yyyy], [dd month yyyy]
export type TDateFormat = "en" | "ru";

export type TDir = "ltr" | "rtl";

@Entity({name: "a7_langs"})
export class CLang extends CEntity implements IImagable {
    @Column({nullable: false, unique: true})
    public slug: string;

    @Column({nullable: true, default: null})
    public title: string;

    @Column({nullable: true, default: null})
    public shorttitle: string;

    @Column({nullable: true, default: null})
    public img: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Column({nullable: false, default: true})
    public active: boolean;

    @Column({nullable: false, default: false})
    public slugable: boolean;

    @Column({type: "enum", enum: ["ltr", "rtl"], nullable: false, default: "ltr"})
    public dir: TDir;

    @Column({type: "enum", enum: ["en", "ru"], nullable: false, default: "en"})
    public dateformat: TDateFormat;

    @Column({nullable: true, default: null})
    public locale: string;
}

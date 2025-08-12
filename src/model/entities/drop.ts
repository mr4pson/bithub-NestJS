import { Column, Entity, Index, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { IImagable } from "../imagable.interface";
import { CEntityTranslation } from "./_entity.translation";
import { CDropTranslation } from "./drop.translation";

@Entity({name: "a7_drops"})
export class CDrop extends CEntity implements IImagable {
    @Index()
    @Column({nullable: true, default: null})
    public name: string;

    @Column({nullable: true, default: null})
    public img: string;

    @Column({nullable: true, default: null})
    public drop: string;

    @Column({nullable: false, default: false})
    public early: boolean;

    @Column({nullable: false, default: 0})
    public score: number;

    @Column({nullable: false, default: 0})
    public spending_money: number;

    @Column({nullable: false, default: 0})
    public spending_time: number;

    @Column({nullable: false, default: 0})
    public term: number;

    @Column({nullable: true, default: null})
    public fundrising: string;

    @Column({nullable: true, default: null})
    public cat: string;

    @Column({type: "date", nullable: true, default: null})
    public date: string;

    ////////////////
    // relations
    ////////////////

    @OneToMany(type => CDropTranslation, translation => translation.drop, {cascade: true})
    public translations: CDropTranslation[];
}


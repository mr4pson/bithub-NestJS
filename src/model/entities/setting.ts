import { Column, Entity, Index } from "typeorm";
import { CEntity } from "./_entity";

@Entity({name: "a7_settings"})
export class CSetting extends CEntity {
    @Column({nullable: true, default: null, unique: true})
    public p: string;

    @Column({nullable: true, default: null})
    public v: string;

    @Column({nullable: true, default: null})
    public c: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Index()
    @Column({nullable: false, default: "all"})
    public load_to: string;

    @Column({nullable: false, default: false, select: false})
    public hidden: boolean;
}

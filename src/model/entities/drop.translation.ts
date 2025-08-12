import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CDrop } from "./drop";

@Entity({name: "a7_drop_translations"})
export class CDropTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public drop_id: number;

    @Column({nullable: true, default: null})
    public tasks: string;

    @Column({nullable: true, default: null})
    public invest: string;

    @Column({nullable: true, default: null})
    public link: string;

    // relations
    @ManyToOne(type => CDrop, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "drop_id"})
    public drop: CDrop;
}

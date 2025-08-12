import { Column, CreateDateColumn, Entity } from "typeorm";
import { CEntity } from "./_entity";

@Entity({name: "a7_errors"})
export class CError extends CEntity {    
    @Column({nullable: true, default: null})
    public source: string;

    @Column({nullable: true, default: null, type: "text"})
    public text: string;

    @CreateDateColumn({type: "timestamp"})
    public created_at: Date;
}

import { Column, Entity } from "typeorm";
import { CEntity } from "./_entity";
import { IImagable } from "../imagable.interface";

@Entity({name: "a7_linktypes"})
export class CLinktype extends CEntity implements IImagable {
    @Column({nullable: true, default: null})
    public name: string;    

    @Column({nullable: true, default: null})
    public img: string;
}

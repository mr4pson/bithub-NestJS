import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CAdminGroup } from "./admin.group";
import { CEntity } from "./_entity";
import { IImagable } from "../imagable.interface";

@Entity({name: "a7_admins"})
export class CAdmin extends CEntity implements IImagable {
    @Column({nullable: false, default: 1})
    public group_id: number;  

    @Column({nullable: false, unique: true})
    public email: string;

    @Column({nullable: false, select: false})
    public password: string;

    @Column({nullable: true, default: null})
    public name: string;  

    @Column({nullable: true, default: null})
    public img: string;
    
    @Column({nullable: false, default: true})
    public active: boolean;

    @Column({nullable: false, default: false, select: false})
    public hidden: boolean;

    // relations
    @ManyToOne(type => CAdminGroup, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "group_id"})
    public group: CAdminGroup;
}

import { Column, Entity } from "typeorm";
import { CEntity } from "./_entity";

@Entity({name: "a7_admin_groups"})
export class CAdminGroup extends CEntity {
    @Column({nullable: true, default: null})
    public name: string;    
}

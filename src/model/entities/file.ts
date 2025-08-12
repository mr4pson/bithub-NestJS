import { Column, Entity, Index } from "typeorm";
import { CEntity } from "./_entity";

@Entity({name: "a7_files"})
export class CFile extends CEntity {
    @Column({nullable: false, unique: true})
    mark: string;

    @Column({nullable: false})
    filename: string;

    @Column({nullable: false})
    fileurl: string;

    @Column({nullable: false})
    filetype: string;

    @Index()
    @Column({nullable: false, default: "all"})
    load_to: string;    
}

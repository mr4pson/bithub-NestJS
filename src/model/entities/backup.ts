import { Column, CreateDateColumn, Entity } from "typeorm";
import { CEntity } from "./_entity";

export type TBackupType = "files" | "db";

@Entity({name: "a7_backups"})
export class CBackup extends CEntity {
    @Column({nullable: true, default: null})
    public filename: string;

    @Column({type: "enum", enum: ["files", "db"], nullable: false, default: "files"})
    public type: TBackupType;

    @Column({nullable: false, default: false})
    public ready: boolean;

    @CreateDateColumn({type: "timestamp"})
    public created_at: Date;
}

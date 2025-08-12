import { Column, CreateDateColumn, Entity } from "typeorm";
import { CEntity } from "./_entity";

@Entity({name: "a7_mailings"})
export class CMailing extends CEntity {
    @Column({nullable: true, default: null})
    public subject: string;

    @Column({type: "text", nullable: true, default: null})
    public content: string;

    @Column({type: "longtext", nullable: true, default: null, select: false})
    public recipients: string;

    @Column({type: "enum", enum: ["idle", "running", "error"], nullable: false, default: "idle"})
    public status: TMailingStatus;

    @Column({nullable: true, default: null})
    public running_status: string;

    @CreateDateColumn({nullable: false, type: "timestamp"})
    public created_at: Date;
}

export type TMailingStatus = "idle" | "running" | "error";

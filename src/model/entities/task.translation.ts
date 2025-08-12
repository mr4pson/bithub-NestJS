import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CTask } from "./task";

@Entity({name: "a7_task_translations"})
export class CTaskTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public task_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public name: string; 
    
    @Column({type: "longtext", nullable: true, default: null, select: false}) // select:false - по умолчанию не загружаем контент, потому что контент бывает большим, а при обзоре списка он не нужен
    public content: string;

    // relations
    @ManyToOne(type => CTask, {onDelete: "CASCADE", onUpdate: "CASCADE", cascade: false})
    @JoinColumn({name: "task_id"})
    public task: CTask;
}

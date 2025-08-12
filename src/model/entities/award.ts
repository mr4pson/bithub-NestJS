import { Column, Entity, Index, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CAwardTranslation } from "./award.translation";

@Entity({name: "a7_awards"})
export class CAward extends CEntity {
    @Column({nullable: true, default: null})
    public img: string;

    @Column({nullable: false, default: 0})
    public investments: number;

    @Column({nullable: false, default: 0})
    public earnings: number;

    @Index()
    @Column({type: "date", nullable: true, default: null})
    public date: string;

    @Column({nullable: false, default: true})
    public active: boolean;

    ////////////////
    // relations
    ////////////////

    @OneToMany(type => CAwardTranslation, translation => translation.award, {cascade: true})
    public translations: CAwardTranslation[];  

    /////////////////
    // utils
    /////////////////

    public fakeInit(counter: number): CAward {
        this.img = `test${this.random(1, 3)}.png`;
        this.investments = this.random(1, 10);
        this.earnings = this.random(1000, 10000);
        const date = new Date();
        date.setMonth(date.getMonth() - counter);
        this.date = this.mysqlDate(date);
        this.active = true;

        // translations
        const t1 = new CAwardTranslation();
        t1.lang_id = 1;
        t1.name = `Тестовая награда ${counter}`;
        
        const t2 = new CAwardTranslation();
        t2.lang_id = 6;
        t2.name = `Тестова нагорода ${counter}`;
        
        const t3 = new CAwardTranslation();
        t3.lang_id = 7;
        t3.name = `Test award ${counter}`;        

        this.translations = [t1, t2, t3];
        return this;
    } 
}
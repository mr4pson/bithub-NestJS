import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CEntity } from './_entity';
import { CGuideTranslation } from './guide.translation';
import { CGuideLink } from './guide.link';
import { CTask } from './task';
import { CCat } from './cat';
import { IImagable } from '../imagable.interface';
import { CFavorition } from './favorition';
import { CGuideNote } from './guide.note';

export enum GuideTypes {
  FullStepsAvaliable = 'full_steps_available',
  TwoStepsAvailable = 'two_steps_available',
  LimitAfterAuthAvailable = 'limit_after_auth_available',
  Gem = 'gem',
}

@Entity({ name: 'a7_guides' })
export class CGuide extends CEntity implements IImagable {
  @Column({ nullable: true, default: null })
  public cat_id: number;

  @Column({ nullable: false })
  public slug: string;

  @Column({ nullable: true, default: null })
  public img: string;

  @Column({ type: 'float', nullable: false, default: 0 })
  public invest: number;

  //@Column({type: "float", nullable: false, default: 0})
  //public twitter_score: number;

  //@Column({nullable: true, default: null})
  //public twitter_username: string;

  @Column({ type: 'float', nullable: false, default: 0 })
  public bh_score: number;

  @Column({ nullable: false, default: 0, select: false })
  public time: number;

  @Column({ nullable: false, default: 0, select: false })
  public price: number;

  @Index()
  @Column({
    type: 'enum',
    enum: ['none', 'drop', 'possible_drop', 'early_access', 'points'],
    nullable: false,
    default: 'none',
  })
  public earnings: TGuideEarnings;

  @Index()
  @Column({
    type: 'enum',
    enum: ['current', 'ending', 'expired'],
    nullable: false,
    default: 'current',
  })
  public status: TGuideStatus;

  @Column({ nullable: false, default: false })
  public hit: boolean;

  @Column({ nullable: false, default: true })
  public active: boolean;

  @Column({ nullable: false, default: GuideTypes.FullStepsAvaliable })
  public type: GuideTypes;

  @Column({ nullable: true, default: true })
  public steps_limit?: number;

  @Column({ nullable: true, default: undefined })
  public available_for?: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  public created_at: Date;

  ////////////////
  // relations
  ////////////////

  @OneToMany((type) => CGuideTranslation, (translation) => translation.guide, {
    cascade: true,
  })
  public translations: CGuideTranslation[];

  @OneToMany((type) => CGuideLink, (link) => link.guide, { cascade: true })
  public links: CGuideLink[];

  @OneToMany((type) => CTask, (task) => task.guide, { cascade: true })
  public tasks: CTask[];

  @ManyToOne((type) => CCat, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'cat_id' })
  public cat: CCat;

  @OneToMany((type) => CFavorition, (favorition) => favorition.guide, {
    cascade: false,
  })
  public favoritions: CFavorition[];

  @OneToMany((type) => CGuideNote, (note) => note.guide, { cascade: false })
  public notes: CGuideNote[];

  /////////////////
  // utils
  /////////////////

  public fakeInit(cat_id: number, counter: number): CGuide {
    this.cat_id = cat_id;
    this.img = `test${[1, 2][this.random(0, 1)]}.jpg`;
    this.invest = this.random(100, 1000);
    //this.twitter_score = this.random(0, 1000);
    //this.twitter_username = ["kevinrose", "aeyakovenko", "karaswisher"][this.random(0,2)];
    this.bh_score = this.random(0, 1000);

    // translations
    const t1 = new CGuideTranslation();
    t1.lang_id = 1;
    t1.name = `Название гайда ${counter}`;
    t1.contentshort = `Краткое описание гайда ${counter} Краткое описание гайда ${counter} Краткое описание гайда ${counter} Краткое описание гайда ${counter} Краткое описание гайда`;
    t1.content = `
            <p>Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter}</p>
            <p>Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter}</p>
            <p>Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter} Полное описание гайда ${counter}</p>
        `;

    const t2 = new CGuideTranslation();
    t2.lang_id = 6;
    t2.name = `Назва гайду ${counter}`;
    t2.contentshort = `Короткий опис гайду ${counter} Короткий опис гайду ${counter} Короткий опис гайду ${counter} Короткий опис гайду ${counter} Короткий опис гайду`;
    t2.content = `
            <p>Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter}</p>
            <p>Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter}</p>
            <p>Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter} Повний опис гайду ${counter}</p>
        `;

    const t3 = new CGuideTranslation();
    t3.lang_id = 7;
    t3.name = `Guide name ${counter}`;
    t3.contentshort = `Short guide description ${counter} Short guide description ${counter} Short guide description ${counter} Short guide description ${counter} Short guide description`;
    t3.content = `
            <p>Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter}</p>
            <p>Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter}</p>
            <p>Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter} Full guide description ${counter}</p>
        `;

    this.translations = [t1, t2, t3];

    // links
    this.links = [];
    const linktype_ids = [1, 2, 3, 4, 5];

    for (let i = 0; i < linktype_ids.length; i++) {
      const link = new CGuideLink();
      link.linktype_id = linktype_ids[i];
      link.value = 'https://google.com';
      link.pos = i;
      this.links.push(link);
    }

    // tasks
    const q = this.random(10, 20);
    this.tasks = [];

    for (let i = 0; i < q; i++) {
      this.tasks.push(new CTask().fakeInit(i));
    }

    this.tasks[q - 1].type = 'extra';

    // time and time
    this.time = this.tasks
      .filter((t) => t.type === 'main')
      .reduce((acc, t) => acc + t.time, 0);
    this.price = this.tasks
      .filter((t) => t.type === 'main')
      .reduce((acc, t) => acc + t.price, 0);
    return this;
  }
}

export type TGuideStatus = 'current' | 'ending' | 'expired';

export type TGuideEarnings =
  | 'none'
  | 'drop'
  | 'possible_drop'
  | 'early_access'
  | 'points';

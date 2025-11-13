import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CEntity } from './_entity';
import { CReading } from './reading';
import { CToolTranslation } from './tool.translation';
import { CToolReading } from './tool-reading';
import { CToolcat } from './toolcat';

@Entity({ name: 'a7_tools' })
export class CTool extends CEntity {
  @Column({ nullable: true, default: null })
  public toolcat_id: number;

  @Index({ unique: true })
  @Column({ nullable: false })
  public slug: string;

  @Index()
  @Column({ type: 'date', nullable: true, default: null })
  public date: string;

  @Column({ nullable: true, default: null })
  public img: string;

  @Column({ type: 'text', nullable: true, default: null })
  public yt_content: string;

  @Column({ nullable: false, default: 0 })
  public readtime: number;

  @Column({ nullable: false, default: true })
  public active: boolean;

  @Column({ nullable: true, default: false })
  public is_for_landing: boolean;

  ////////////////
  // relations
  ////////////////

  @OneToMany((type) => CToolTranslation, (translation) => translation.tool, {
    cascade: true,
  })
  public translations: CToolTranslation[];

  @OneToMany((type) => CToolReading, (reading) => reading.tool, {
    cascade: false,
  })
  public readings: CReading[];

  @ManyToOne((type) => CTool, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'toolcat_id' })
  public toolcat: CToolcat;

  /////////////////
  // utils
  /////////////////

  public fakeInit(counter: number): CTool {
    this.toolcat_id = [2, 3][this.random(0, 1)];
    this.slug = `test-tool-${counter}`;
    const date = new Date();
    date.setDate(date.getDate() - counter);
    this.date = this.mysqlDate(date);
    const rnd_img = this.random(1, 3);
    this.img = `test${rnd_img}.jpg`;
    this.readtime = this.random(20, 60);
    this.active = true;

    // translations
    const t1 = new CToolTranslation();
    t1.lang_id = 1;
    t1.name = `Тестовый заголовок статьи ${counter}`;
    t1.contentshort = `Краткое содержание статьи ${counter} Краткое содержание статьи ${counter} Краткое содержание статьи ${counter}`;
    t1.content = `
            <p>Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} </p>
            <p>Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} </p>
            <p>Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} </p>
            <p>Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} </p>
            <p>Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} </p>
            <p>Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} </p>
            <p>Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} </p>
            <p>Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} </p>
            <p>Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} Полное содержание статьи ${counter} </p>
        `;

    const t2 = new CToolTranslation();
    t2.lang_id = 6;
    t2.name = `Тестовий заголовок статті ${counter}`;
    t2.contentshort = `Короткий зміст статті ${counter} Короткий зміст статті ${counter} Короткий зміст статті ${counter} Короткий зміст статті ${counter} `;
    t2.content = `
            <p>Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} </p>
            <p>Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} </p>
            <p>Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} </p>
            <p>Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} </p>
            <p>Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} </p>
            <p>Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} </p>
            <p>Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} </p>
            <p>Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} </p>
            <p>Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} Повний зміст статті ${counter} </p>
        `;

    const t3 = new CToolTranslation();
    t3.lang_id = 7;
    t3.name = `Test article head ${counter}`;
    t3.contentshort = `Short content of test article ${counter} Short content of test article ${counter} Short content of test article ${counter}`;
    t3.content = `
            <p>Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter}</p>
            <p>Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter}</p>
            <p>Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter}</p>
            <p>Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter}</p>
            <p>Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter}</p>
            <p>Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter}</p>
            <p>Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter}</p>
            <p>Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter}</p>
            <p>Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter} Full content of test article ${counter}</p>
        `;

    this.translations = [t1, t2, t3];
    return this;
  }
}

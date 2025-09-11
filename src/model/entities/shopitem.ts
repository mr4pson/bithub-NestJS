import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CEntity } from './_entity';
import { CShopitemTranslation } from './shopitem.translation';
import { CShopcat } from './shopcat';

@Entity({ name: 'a7_shopitems' })
export class CShopitem extends CEntity {
  @Column({ nullable: true, default: null })
  public shopcat_id: number;

  @Index()
  @Column({ type: 'date', nullable: true, default: null })
  public date: string;

  @Column({ nullable: true, default: null })
  public img: string;

  @Column({ nullable: false, default: 0 })
  public price: number;

  @Column({ nullable: true, default: 0 })
  public discount: number;

  @Column({ nullable: false, default: 0 })
  public min_items_num: number;

  @Column({ nullable: true, default: 1 })
  public priceStep: number;

  @Column({ nullable: false, default: true })
  public active: boolean;

  @Column({ nullable: false, default: false, select: false })
  public archived: boolean;

  @Column({ nullable: true, default: undefined })
  public available_for?: string;

  ////////////////
  // relations
  ////////////////

  @OneToMany(
    (type) => CShopitemTranslation,
    (translation) => translation.shopitem,
    { cascade: true },
  )
  public translations: CShopitemTranslation[];

  @ManyToOne((type) => CShopcat, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'shopcat_id' })
  public shopcat: CShopcat;

  /////////////////
  // utils
  /////////////////

  public fakeInit(counter: number): CShopitem {
    this.shopcat_id = [1, 2][this.random(0, 1)];
    const date = new Date();
    date.setDate(date.getDate() - counter);
    this.date = this.mysqlDate(date);
    const rnd_img = this.random(1, 3);
    this.img = `test${rnd_img}.jpg`;
    this.active = true;

    // translations
    const t1 = new CShopitemTranslation();
    t1.lang_id = 1;
    t1.name = `Тестовый заголовок товара ${counter}`;
    t1.contentshort = `Краткое описание товара ${counter} Краткое описание товара ${counter} Краткое описание товара ${counter}`;
    t1.content = `
            <p>Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} </p>
            <p>Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} </p>
            <p>Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} </p>
            <p>Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} </p>
            <p>Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} </p>
            <p>Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} </p>
            <p>Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} </p>
            <p>Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} </p>
            <p>Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} Полное описание товара ${counter} </p>
        `;

    const t2 = new CShopitemTranslation();
    t2.lang_id = 6;
    t2.name = `Тестовий заголовок товару ${counter}`;
    t2.contentshort = `Короткий опис товару ${counter} Короткий опис товару ${counter} Короткий опис товару ${counter} Короткий опис товару ${counter} `;
    t2.content = `
            <p>Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} </p>
            <p>Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} </p>
            <p>Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} </p>
            <p>Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} </p>
            <p>Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} </p>
            <p>Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} </p>
            <p>Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} </p>
            <p>Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} </p>
            <p>Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} Повний опис товару ${counter} </p>
        `;

    const t3 = new CShopitemTranslation();
    t3.lang_id = 7;
    t3.name = `Test shopitem head ${counter}`;
    t3.contentshort = `Short description of test shopitem ${counter} Short description of test shopitem ${counter} Short description of test shopitem ${counter}`;
    t3.content = `
            <p>Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter}</p>
            <p>Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter}</p>
            <p>Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter}</p>
            <p>Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter}</p>
            <p>Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter}</p>
            <p>Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter}</p>
            <p>Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter}</p>
            <p>Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter}</p>
            <p>Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter} Full description of test shopitem ${counter}</p>
        `;

    this.translations = [t1, t2, t3];
    return this;
  }
}

import { Column, Entity, OneToMany } from 'typeorm';
import { CEntity } from './_entity';
import { CCatTranslation } from './cat.translation';

@Entity({ name: 'a7_cats' })
export class CCat extends CEntity {
  @Column({ nullable: false, default: false })
  public paid: boolean; // категория для юзеров с оплаченным тарифом

  @Column({ nullable: false, default: 0 })
  public pos: number;

  // relations
  @OneToMany((type) => CCatTranslation, (translation) => translation.cat, {
    cascade: true,
  })
  public translations: CCatTranslation[];
}

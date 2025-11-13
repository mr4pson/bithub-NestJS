import { Column, Entity, OneToMany } from 'typeorm';
import { CEntity } from './_entity';
import { CToolcatTranslation } from './toolcat.translation';

@Entity({ name: 'a7_toolcats' })
export class CToolcat extends CEntity {
  @Column({ nullable: false, default: 0 })
  public pos: number;

  // relations
  @OneToMany(
    (type) => CToolcatTranslation,
    (translation) => translation.toolcat,
    { cascade: true },
  )
  public translations: CToolcatTranslation[];
}

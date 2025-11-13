import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CEntityTranslation } from './_entity.translation';
import { CToolcat } from './toolcat';

@Entity({ name: 'a7_toolcat_translations' })
export class CToolcatTranslation extends CEntityTranslation {
  @Column({ nullable: false })
  public toolcat_id: number;

  @Column({ nullable: true, default: null })
  public name: string;

  // relations
  @ManyToOne((type) => CToolcat, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'toolcat_id' })
  public toolcat: CToolcat;
}

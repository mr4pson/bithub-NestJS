import { Column, Entity, OneToMany } from 'typeorm';
import { CEntity } from './_entity';
import { CTariffTranslation } from './tariff.translation';

export type TTariffType = 'subscription' | 'onetime';

@Entity({ name: 'a7_tariffs' })
export class CTariff extends CEntity {
  @Column({
    type: 'enum',
    enum: ['subscription', 'onetime'],
    nullable: false,
    default: 'subscription',
  })
  public type: TTariffType;

  @Column({ type: 'float', nullable: false, default: 1 })
  public price: number;

  @Column({ nullable: false, default: 1 })
  public period: number;

  @Column({ nullable: true, default: null })
  public code: string;

  @Column({ nullable: false, default: false })
  public top: boolean;

  @Column({ nullable: false, default: 0 })
  public pos: number;

  /////////////////
  // relations
  /////////////////

  @OneToMany(
    (type) => CTariffTranslation,
    (translation) => translation.tariff,
    { cascade: true },
  )
  public translations: CTariffTranslation[];
}

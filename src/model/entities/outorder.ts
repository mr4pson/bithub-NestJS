import { Column, CreateDateColumn, Entity, Index } from 'typeorm';
import { CEntity } from './_entity';

@Entity({ name: 'a7_outorders' })
export class COutorder extends CEntity {
  @Index()
  @Column({ nullable: true, default: null })
  public outer_id: string;

  @Index()
  @Column({ nullable: true, default: null })
  public user_email: string;

  @Index()
  @Column({ nullable: false, default: 0 })
  public amount: number;

  @Column({ nullable: true, default: null })
  public purpose: string; // назначение платежа (за что оплачено)

  @Column({ nullable: true, default: null })
  public tariff_id: number;

  @Column({ nullable: true, default: null })
  public qty: number;

  @Column({ nullable: true, default: null })
  public subType: string;

  @Column({ nullable: true, default: null })
  public promocode: string;

  @Column({ nullable: false, default: false })
  public completed: boolean;

  @Index()
  @CreateDateColumn({ nullable: false, type: 'timestamp' })
  public created_at: Date;
}

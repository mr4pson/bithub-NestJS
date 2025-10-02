import { Column, CreateDateColumn, Entity, Index } from 'typeorm';
import { CEntity } from './_entity';

// заявки на пополнение счета
@Entity({ name: 'a7_withdraworders' })
export class CWithdraworder extends CEntity {
  @Index()
  @Column({ nullable: true, default: null })
  public email: string;

  @Column({ nullable: false, default: 0 })
  public amount: number;

  @Index()
  @Column({ nullable: false, default: '' })
  public wallet: string;

  @Column({ nullable: false, default: '' })
  public tg: string;

  @Column({ nullable: false, default: '' })
  public comment: string;

  @Column({ nullable: false, default: false })
  public completed: boolean;

  @Index()
  @CreateDateColumn({ nullable: false, type: 'timestamp' })
  public created_at: Date;
}

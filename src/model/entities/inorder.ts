import { Column, CreateDateColumn, Entity, Index } from 'typeorm';
import { CEntity } from './_entity';

// заявки на пополнение счета
@Entity({ name: 'a7_inorders' })
export class CInorder extends CEntity {
  @Index()
  @Column({ nullable: true, default: null })
  public outer_id: string;

  @Index()
  @Column({ nullable: true, default: null })
  public user_email: string;

  @Index()
  @Column({ nullable: false, default: 0 })
  public expected_amount: number;

  @Index()
  @Column({ nullable: false, default: 0 })
  public received_amount: number;

  @Column({ nullable: false, default: false })
  public completed: boolean;

  @Index()
  @CreateDateColumn({ nullable: false, type: 'timestamp' })
  public created_at: Date;
}

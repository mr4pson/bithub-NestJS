import { Column, CreateDateColumn, Entity, Index } from 'typeorm';
import { CEntity } from './_entity';

@Entity({ name: 'a7_reforders' })
export class CReforder extends CEntity {
  @Index()
  @Column({ nullable: true, default: null })
  public referrer_email: string;

  @Index()
  @Column({ nullable: true, default: null })
  public referee_email: string;

  @Index()
  @Column({ nullable: true, default: null })
  public type: 'inorder' | 'shoporder' | 'outorder';

  @Index()
  @Column({ nullable: true, default: null })
  public order_id: number;

  @Index()
  @Column({
    nullable: false,
    default: 0,
    // , type: 'float'
  })
  public amount: number;

  @Index()
  @CreateDateColumn({ nullable: false, type: 'timestamp' })
  public created_at: Date;
}

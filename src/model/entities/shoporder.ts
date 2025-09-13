import { Column, CreateDateColumn, Entity, Index, OneToMany } from 'typeorm';
import { CEntity } from './_entity';
import { CShoporderItem } from './shoporder.item';

@Entity({ name: 'a7_shoporders' })
export class CShoporder extends CEntity {
  @Index()
  @Column({ nullable: true, default: null })
  public outer_id: string;

  @Index()
  @Column({ nullable: false })
  public email: string;

  @Index()
  @Column({ nullable: true, default: null })
  public wallet: string;

  @Index()
  @Column({ nullable: true, default: null })
  public tg: string;

  @Column({ type: 'text', nullable: true, default: null })
  public comment: string;

  @Column({
    type: 'enum',
    enum: ['created', 'paid', 'completed', 'rejected'],
    nullable: false,
    default: 'created',
  })
  public status: TShoporderStatus;

  @Index()
  @CreateDateColumn({ nullable: false, type: 'timestamp' })
  public created_at: Date;

  ////////////////
  // relations
  ////////////////

  @OneToMany(() => CShoporderItem, (item) => item.shoporder, { cascade: true })
  public items: CShoporderItem[];
}

export type TShoporderStatus = 'created' | 'paid' | 'completed' | 'rejected';

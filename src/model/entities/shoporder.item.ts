import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CShoporder } from './shoporder';
import { CShopitem } from './shopitem';

@Entity({ name: 'a7_shoporder_items' })
export class CShoporderItem {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public shoporder_id: number;

  @Column({ nullable: false })
  public shopitem_id: number;

  @Column({ nullable: false, default: 1 })
  public qty: number;

  @ManyToOne(() => CShoporder, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shoporder_id' })
  public shoporder: CShoporder;

  @ManyToOne(() => CShopitem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shopitem_id' })
  public shopitem: CShopitem;
}

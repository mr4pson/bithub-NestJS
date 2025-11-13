import { Entity, Column, CreateDateColumn } from 'typeorm';
import { CEntity } from './_entity';

// simple traffic log for counting events (logins, visits, etc.)
@Entity({ name: 'a7_traffic' })
export class CTraffic extends CEntity {
  @Column({ nullable: true, default: null })
  public user_id: number;

  @Column({ nullable: false })
  public type: string; // e.g. 'tg_login', 'pageview'

  @CreateDateColumn({ nullable: false, type: 'timestamp' })
  public created_at: Date;
}

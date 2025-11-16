import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CUser } from './user';
import { CArticle } from './article';

// эта сущность хранит факты прочтения статей пользователями
@Entity({ name: 'a7_readings' })
export class CReading {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public user_id: number;

  @Column({ nullable: false })
  public article_id: number;

  // store created_at but do NOT set default CURRENT_TIMESTAMP — keep nullable and default null
  @Index()
  @Column({ type: 'timestamp', nullable: true, default: null })
  public created_at: Date;

  ///////////////
  // relations
  ///////////////

  @ManyToOne((type) => CUser, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'user_id' })
  public user: CUser;

  @ManyToOne((type) => CArticle, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'article_id' })
  public article: CArticle;
}

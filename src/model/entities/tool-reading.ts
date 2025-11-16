import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CUser } from './user';
import { CTool } from './tool';

// эта сущность хранит факты прочтения статей пользователями
@Entity({ name: 'a7_tool_readings' })
export class CToolReading {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public user_id: number;

  @Column({ nullable: false })
  public tool_id: number;

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

  @ManyToOne((type) => CTool, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'article_id' })
  public tool: CTool;
}

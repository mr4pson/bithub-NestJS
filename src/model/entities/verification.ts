import { Column, CreateDateColumn, Entity, Index } from 'typeorm';
import { CEntity } from './_entity';

@Entity({ name: 'a7_verifications' })
export class CVerification extends CEntity {
  @Index()
  @Column({ nullable: true, default: null })
  public login: string;

  @Index()
  @Column({ nullable: true, default: null })
  public code: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  public created_at: Date;
}

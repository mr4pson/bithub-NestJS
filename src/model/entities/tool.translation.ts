import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CEntityTranslation } from './_entity.translation';
import { CTool } from './tool';

@Entity({ name: 'a7_tool_translations' })
export class CToolTranslation extends CEntityTranslation {
  @Column({ nullable: false })
  public tool_id: number;

  @Index()
  @Column({ nullable: true, default: null })
  public name: string;

  @Column({ type: 'longtext', nullable: true, default: null })
  public content: string;

  @Column({ type: 'text', nullable: true, default: null })
  public contentshort: string;

  @Column({ nullable: true, default: null })
  public title: string;

  @Column({ type: 'text', nullable: true, default: null })
  public description: string;

  @Column({ type: 'text', nullable: true, default: null })
  public canonical: string;

  @Index()
  @Column({ nullable: true, default: null })
  public h1: string;

  @Index()
  @Column({ nullable: true, default: null })
  public keywords: string; // used for search, not for <meta>

  ///////////////
  // relations
  ///////////////

  @ManyToOne((type) => CTool, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'tool_id' })
  public tool: CTool;
}

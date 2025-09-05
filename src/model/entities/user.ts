import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CEntity } from './_entity';
import { CLang } from './lang';
import { IChildable } from '../childable.interface';
import { IImagable } from '../imagable.interface';
import { CCompletion } from './completion';
import { CFavorition } from './favorition';

@Entity({ name: 'a7_users' })
export class CUser extends CEntity implements IChildable, IImagable {
  @Index({ unique: true })
  @Generated('uuid')
  @Column({ nullable: false })
  uuid: string;

  @Column({ nullable: false, default: 1 })
  public lang_id: number;

  @Column({ nullable: true, default: null })
  public parent_id: number;

  @Column({ nullable: true, default: null })
  public referrer_id: number;

  @Column({ nullable: false, unique: true })
  public email: string;

  @Column({ nullable: false, select: false })
  public password: string;

  @Index()
  @Column({ nullable: true, default: null })
  public name: string;

  @Index()
  @Column({ nullable: true, default: null })
  public wallet: string;

  @Column({ nullable: true, default: null })
  public img: string;

  @Column({ nullable: false, default: true })
  public active: boolean;

  @Column({ nullable: false, default: false })
  public verified: boolean;

  @Column({ nullable: false, default: 0, type: 'float' })
  public money: number; // денежный счет

  @Column({ nullable: false, default: 0 })
  public points: number; // баллы

  @Column({ type: String, nullable: true, default: null })
  public subType?: 'dg-pro' | 'dg-team'; // тип подписки

  @Index()
  @Column({ type: 'timestamp', nullable: true, default: null })
  public paid_at: Date; // дата активации подписки

  @Index()
  @Column({ type: 'timestamp', nullable: true, default: null })
  public paid_until: Date; // дата окончания подписки

  @Column({ nullable: false, default: 0 })
  public children_limit: number; // лимит субаккаунтов

  @Index()
  @Column({ nullable: false, default: 0 })
  public freetasks: number; // при просмотре тасков без оплаченной подписки это число увеличивается, пока не достигнет параметра site-freetasks (в настройках), после чего юзера будет перекидывать на оплату

  @Index()
  @Column({ type: 'timestamp', nullable: true, default: null })
  public freetask_viewed_at: Date; // записываем дату бесплатного просмотра, скрипт-обходчик будет обнулять счетчик freetasks через некоторое время

  @Column({ nullable: false, default: 20 })
  public referral_percent: number;

  @Index()
  @Column({ nullable: true, default: null, type: 'bigint' })
  public tg_id: number;

  @Column({ nullable: false, default: false })
  public tg_active: boolean; // юзер может отключить бота в самом Telegram, а потом включить его в том же окне Telegram, но в этом случае мы не получим payload в тексте /start, поэтому мы не будем затирать tg_id при отписке, а будем лишь деактивировать на своей стороне, чтобы потом можно было реактировать

  @Column({ nullable: false, default: true })
  public tg_tasks: boolean; // получать новые таски по избранным гайдам

  @Column({ nullable: false, default: true })
  public tg_guides: boolean; // получать новые гайды

  @Column({ nullable: false, default: true })
  public tg_articles: boolean; // получать новые статьи

  @Column({ nullable: false, default: true })
  public tg_deadlines: boolean; // получать напоминания о дедлайнах для невыполненных тасков по избранным гайдам

  @Column({ nullable: true, default: null })
  public tg_invite: string; // ссылка на закрытую группу

  @Column({ nullable: false, default: 0 })
  public tz: number; // здесь сохраняем timezone offset

  @Index()
  @CreateDateColumn({
    nullable: false,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  /////////////////
  // relations
  /////////////////

  @ManyToOne((type) => CLang, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'lang_id' })
  public lang: CLang;

  @OneToMany((type) => CUser, (child) => child.parent, { cascade: false })
  public children: CUser[];

  @ManyToOne((type) => CUser, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'parent_id' })
  public parent: CUser;

  @ManyToOne((type) => CUser, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    cascade: false,
  })
  @JoinColumn({ name: 'referrer_id' })
  public referrer: CUser;

  @OneToMany((type) => CUser, (referee) => referee.referrer, { cascade: false })
  public referees: CUser[];

  @OneToMany((type) => CCompletion, (completion) => completion.user, {
    cascade: false,
  })
  public completions: CCompletion[];

  @OneToMany((type) => CFavorition, (favorition) => favorition.user, {
    cascade: false,
  })
  public favoritions: CFavorition[];

  //////////////
  // helpers
  //////////////

  public __shift = '';
  public __level = 0;
  public children_q?: number;

  ////////////////
  // utils
  ////////////////

  public fakeInit(
    counter: number,
    parent_id: number,
    referrer_id: number,
    hasher: (pw: string) => string,
  ): CUser {
    this.lang_id = 1;
    this.parent_id = parent_id;
    this.referrer_id = referrer_id;
    this.email = `rtest${counter}@test.test`;
    this.password = hasher(`123`);
    this.name = `Rtest longname ${counter}`;
    this.wallet = this.randomString(16);
    return this;
  }
}

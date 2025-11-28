export interface IUser {
  readonly id: number;
  readonly uuid: string;
  readonly lang_id: number;
  readonly parent_id: number;
  readonly parent_email: string;
  readonly referrer_id: number;
  readonly email: string;
  readonly name: string;
  readonly wallet: string;
  readonly img: string;
  readonly money: number;
  readonly points: number;
  readonly subType: 'dg-pro' | 'dg-team';
  readonly paid_at: Date;
  readonly paid_until: Date;
  readonly freetasks: number;
  readonly children_limit: number;
  readonly children_q: number; // кол-во субаккаунтов
  readonly overdue: boolean; // оплата просрочена
  readonly referral_percent: number;
  readonly referral_buy_percent: number;
  readonly ref_link?: string;
  readonly refEarnings?: number;
  readonly refViewCount: number; // количество переходов по реферальной ссылке
  readonly refRegCount: number; // количество зарегистрированных пользователей по реф ссылке
  readonly tg_username?: string;
  readonly viewedGuidesCount?: number;
  readonly tg_tasks: boolean;
  readonly tg_guides: boolean;
  readonly tg_articles: boolean;
  readonly tg_deadlines: boolean;
  readonly verified: boolean;
  readonly tz: number;
  readonly created_at: Date;
}

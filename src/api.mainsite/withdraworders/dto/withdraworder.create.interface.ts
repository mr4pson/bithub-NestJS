export interface IWithdraworderCreate {
  readonly tg: string;
  readonly wallet: string;
  readonly amount: number;
  readonly comment: string;
  readonly lang_slug: string;
}

export interface IOutorderCreate {
  readonly tariff_id: number;
  readonly subscriptionType?: string;
  readonly code: string;
  readonly q: number;
  readonly lang_slug: string;
}

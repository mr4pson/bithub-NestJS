export interface IToolcatUpdate {
  readonly id: number;
  readonly pos: number;
  readonly defended: boolean;
  readonly translations: IToolcatTranslationUpdate[];
}

export interface IToolcatTranslationUpdate {
  readonly id: number;
  readonly toolcat_id: number;
  readonly lang_id: number;
  readonly name: string;
}

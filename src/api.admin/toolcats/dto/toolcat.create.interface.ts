export interface IToolcatCreate {
  readonly pos: number;
  readonly translations: IToolcatTranslationCreate[];
}

export interface IToolcatTranslationCreate {
  readonly lang_id: number;
  readonly name: string;
}

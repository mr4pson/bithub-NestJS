export interface IToolUpdate {
  readonly id: number;
  readonly toolcat_id: number;
  readonly slug: string;
  readonly date: string;
  readonly img: string;
  readonly yt_content: string;
  readonly readtime: number;
  readonly is_for_landing: boolean;
  readonly active: boolean;
  readonly defended: boolean;
  readonly translations: IToolTranslationUpdate[];
}

export interface IToolTranslationUpdate {
  readonly id: number;
  readonly tool_id: number;
  readonly lang_id: number;
  readonly name: string;
  readonly content: string;
  readonly contentshort: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly keywords: string;
}

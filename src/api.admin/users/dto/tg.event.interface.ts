export interface ITgEvent {
  readonly update_id: number;
  readonly message?: ITgMessage;
  readonly my_chat_member?: ITgMemberChange;
  readonly callback_query?: ITgCallbackQuery;
}

export interface ITgChat {
  readonly id: number;
  readonly first_name: string;
  readonly username: string;
  readonly type: string;
}

export interface ITgFrom {
  readonly id: number;
  readonly is_bot: boolean;
  readonly first_name: string;
  readonly username: string;
  readonly language_code: string;
}

export interface ITgMessage {
  readonly message_id: number;
  readonly from: ITgFrom;
  readonly chat: ITgChat;
  readonly date: number;
  readonly text: string;
}

export interface ITgMemberChange {
  readonly chat: ITgChat;
  readonly from: ITgFrom;
  readonly date: number;
  readonly old_chat_member: ITgMember;
  readonly new_chat_member: ITgMember;
}

export interface ITgMember {
  readonly user: ITgUser;
  readonly status: 'member' | 'kicked';
  readonly until_date: number;
}

export interface ITgUser {
  readonly id: number;
  readonly is_bot: boolean;
  readonly first_name: string;
  readonly username: string;
}

export interface ITgCallbackQuery {
  readonly id: string;
  readonly from: ITgFrom;
  readonly chat_instance: string;
  readonly data: string;
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as FS from 'fs';
import { DataSource } from 'typeorm';
import { CErrorsService } from './errors.service';
import { CSetting } from 'src/model/entities/setting';
import { cfg } from 'src/app.config';

@Injectable()
export class CTgApiService implements OnModuleInit {
  private client: TelegramClient = null;

  constructor(
    protected dataSource: DataSource,
    protected errorsService: CErrorsService,
  ) {}

  public async onModuleInit(): Promise<void> {
    try {
      if (!cfg.tgInitOnStart) return;
      const apiId = (
        await this.dataSource
          .getRepository(CSetting)
          .findOneBy({ p: 'tgapi-id' })
      )?.v;
      const apiHash = (
        await this.dataSource
          .getRepository(CSetting)
          .findOneBy({ p: 'tgapi-hash' })
      )?.v;
      if (!apiId) throw 'tgapi-id  not found in settings';
      if (!apiHash) throw 'tgapi-hash  not found in settings';
      const sessionString = FS.readFileSync('tg.session.txt', 'utf8');
      const stringSession = new StringSession(sessionString);
      this.client = new TelegramClient(
        stringSession,
        parseInt(apiId),
        apiHash,
        { connectionRetries: 5 },
      );
      await this.client.connect();
      console.log('Telegram API connected');
    } catch (err) {
      this.client = null;
      await this.errorsService.log('CTgApiService.onModuleInit', err);
    }
  }

  public async getGroupInviteLink(groupName: string): Promise<string> {
    try {
      if (!this.client) return null;
      const dialogs = await this.client.invoke(
        new Api.messages.GetDialogs({
          offsetDate: 0,
          offsetId: 0,
          offsetPeer: new Api.InputPeerEmpty(),
          limit: 100,
          hash: BigInt(0) as any,
        }),
      );
      const groups = dialogs['chats'].filter(
        (chat) => chat.title === groupName,
      );
      if (!groups.length) return null;
      const group = groups[0];
      const inviteLink = await this.client.invoke(
        new Api.messages.ExportChatInvite({
          peer: new Api.InputChannel({
            channelId: group.id.value,
            accessHash: group.accessHash.value,
          }),
          usageLimit: 1,
          expireDate: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        }),
      );
      if (!inviteLink) return null;
      return inviteLink['link'];
    } catch (err) {
      await this.errorsService.log('CTgApiService.getGroupInviteLink', err);
    }
  }

  /*
    public async removeUserFromGroup(groupName: string, userTgId: string): Promise<void> {
        try {
            if (!this.client) return;
            const dialogs = await this.client.invoke(
                new Api.messages.GetDialogs({
                    offsetDate: 0,
                    offsetId: 0,
                    offsetPeer: new Api.InputPeerEmpty(),
                    limit: 100,
                    hash: BigInt(0) as any,
                })
            );
            const groups = dialogs["chats"].filter(chat => chat.title === groupName);
            if (!groups.length) return null;
            const group = groups[0];
            console.log(group);
            await this.client.invoke(
                new Api.messages.DeleteChatUser({chatId: BigInt(group.id) as any, userId: userTgId})
            );
        } catch (err) {
            await this.errorsService.log("CTgApiService.removeUserFromGroup", err);
        }
    }
    */
}

import { CMailtemplate } from "src/model/entities/mailtemplate";
import { DataSource } from "typeorm";

export interface IMailtemplateData {
    subject: string;
    content: string;
}

export abstract class CMailableService {
    constructor(protected dataSource: DataSource) {}

    protected abstract sendMessage(...args): Promise<any>;

    protected async getMailtemplateData(name: string, lang_id: number): Promise<IMailtemplateData> {
        const mt = await this.dataSource.getRepository(CMailtemplate).findOne({where: {name}, relations: ["translations"]});            
        
        if (!mt) {
            throw "mailtemplate not found";
        }

        const mtt = mt.translations.find(t => t.lang_id === lang_id);
        const subject = mtt?.subject || "";
        const content = mtt?.content || "";
        return {subject, content};
    }
}

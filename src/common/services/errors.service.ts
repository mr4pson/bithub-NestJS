import { Injectable } from "@nestjs/common";
import { CError } from "src/model/entities/error";
import { DataSource } from "typeorm";
import * as util from "util";

@Injectable()
export class CErrorsService {
    constructor(private dataSource: DataSource) {}

    public async log(source: string, error: any): Promise<string> {
        console.log(`Error in ${source}:`);
        console.log(util.inspect(error, {showHidden: false, depth: null, colors: true}));  
        await this.dataSource.getRepository(CError).save({source, text: String(error)});
        const errorText = `Error in ${source}: ${String(error)}`;
        return errorText; 
    }
}
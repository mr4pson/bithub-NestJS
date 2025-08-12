import { Controller, Get, Query, Res } from "@nestjs/common";
import axios from "axios";
import { Response } from "express";

@Controller('api/mainsite/proxy')
export class CProxyController {
    @Get("download") //?fileurl=...
    public async download(@Query() query: any, @Res() response: Response): Promise<void> {                               
        try {
            const stream = await axios.get(query.fileurl, {responseType: 'stream'});            
            stream.data.pipe(response);
        } catch (err) {
            console.log(err);
            response.end(err);
        }        
    }    
}

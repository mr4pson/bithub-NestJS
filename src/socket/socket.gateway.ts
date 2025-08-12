import { Interval } from '@nestjs/schedule';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { cfg } from 'src/app.config';
import { CAppService } from 'src/common/services/app.service';
import { IWSMessage } from 'src/model/dto/wsmessage.interface';
import { Server } from 'ws';

// этот gateway использует библиотеку ws (а не socket.io, как рекомендовано в рамках Nest)
// SubscribeMessage(event) предполагает, что отправлен JSON в виде {event: string, data: any}
@WebSocketGateway(cfg.wsPort, {path: "/socket", cors: cfg.corsedUrls})
export class CSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() public server: Server;     
    
    constructor(private appService: CAppService) {}
    
    public handleConnection(client: WebSocket): void {
        client["id"] = this.appService.randomString(10) + new Date().getTime(); // just for tests
        console.log("socket connected", client["id"]);
    }

    public handleDisconnect(client: WebSocket) {
        console.log("socket disconnected", client["id"]);
    }
    
    public broadcast(message: IWSMessage): void {
        this.server.clients.forEach(c => c.send(JSON.stringify(message)));
    } 

    /*
    @SubscribeMessage('moved-to-start')
    public onMovedToStart(@MessageBody() data: number): void {
        this.racesAutoService.onMovedToStart(data);
    } 
    */

    ///////////////////
    // utils
    ///////////////////

    // по умолчанию nginx разрывает соединение через некоторое время (вроде бы 1 мин), если ничего не отправляется
    @Interval(30000)
    private ping(): void {
        this.broadcast({event: "ping"});
    }
}

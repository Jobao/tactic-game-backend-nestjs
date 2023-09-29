import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import {Socket, Server} from 'socket.io'
import { ChatDto } from './dto/chat.dto';
import { PrivateChatDto } from './dto/privateChat.dto';
import { serverVar, setServer } from 'src/server';
import { AuthGuard } from 'src/auth/auth.guard';
import { Catch, UnauthorizedException, UseFilters, UseGuards, WsExceptionFilter } from '@nestjs/common';

@UseGuards(AuthGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayInit {
  afterInit(server: any) {
    setServer(server);
  }

  /*@WebSocketServer()
  server: Server;*/

  handleConnection(client: Socket, ...args: any[]) {
    client.join('lobby');
  }
  
  
  @SubscribeMessage('sendPublicChat')
  //@UseFilters(WsExceptionFilter)
  handlePublicMessage(@ConnectedSocket() client: Socket, @MessageBody() chatText:ChatDto) {
    //Recibo el texto y lo envio a todos que estan en el canal
    console.log(client['user']);
    
    
    serverVar.to(Array.from(client.rooms)).emit('publicChat', {id: client.id, text: chatText.text})
  }

  @SubscribeMessage('sendPrivateChat')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() chatText:PrivateChatDto) {

    serverVar.to(chatText.idTo).emit('privateChat', {id: client.id, text: chatText.text})
  }
}

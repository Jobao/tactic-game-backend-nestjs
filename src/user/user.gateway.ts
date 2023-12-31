import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import {Socket} from 'socket.io'
import { CreateUserDto } from './dto/createUser.dto';
import { UserService } from './user.service';
import { CreateUnitDto } from 'src/unit/dto/createUnit.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UserGateway {
  constructor(private userService:UserService){}

  @SubscribeMessage('sendNewUnit')
  newUnit(client:Socket, payload: CreateUnitDto){
    payload.user_uuid = client['user'].sub;
    
     return this.userService.addNewUnit(payload);
  }
}

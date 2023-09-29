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

  @SubscribeMessage('setNewUser')
  newUser(client: Socket, payload: CreateUserDto) {
    this.userService.create(payload);
  }

  @SubscribeMessage('allUser')
  allUsers() {
    this.userService.findAll();
  }

  @SubscribeMessage('sendNewUnit')
  newUnit(client:Socket, payload: CreateUnitDto){
    payload.client_uuid ="fdf8ad27-d284-4c18-bf78-f58bcabd8c58";
    this.userService.addNewUnit(payload);
  }
}

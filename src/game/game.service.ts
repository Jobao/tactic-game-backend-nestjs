import { Injectable } from '@nestjs/common';
import { Game, GameDocument } from './schemas/game.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGameDto } from './dto/createGame.dto';
import { v4 as uuidv4 } from 'uuid';
import { JoinGameDto } from './dto/joinGame.dto';
import { PlaceUnitDto } from './dto/placeUnit.dto';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) private gameModel:Model<GameDocument>){}

    async createGame(cGame:CreateGameDto){
        let temp: string[]=[];
        temp.push(cGame.my_uuid);
        await this.gameModel.create({_id: uuidv4(),owner_uuid: cGame.my_uuid, isStart: false, isEnd: false, users_uuid: [cGame.my_uuid]});
    }

    async joinGame(sol: JoinGameDto){
        let game = await this.gameModel.findById(sol._id);
        if(game){
            if (!game.isEnd && !game.isStart) {
                
                if(game.users_uuid.indexOf(sol.my_uuid) === -1){
                    await this.gameModel.findByIdAndUpdate(game._id,{$push:{'users_uuid': sol.my_uuid}}).exec();
                    
                }
                else{
                    console.log("Ya estoy");
                    
                }
            }
            else{
                console.log('Juego ya en curso o finalizado')
            }
        }
        else{
            console.log("Inexistent game");
        }
        
    }

    async leaveGame(lGame:CreateGameDto){
    /*
     -Si la partida no empezo:
     --Si el que sale es owner -> se elimina la partida :? se retira el jugador
     -SINO (Ya empezo la partida):
     --Se finaliza la partida y avisa al otro jugador de su victoria
     */
     let game= await this.findGame(lGame._id);
     if(!game.isEnd){
        if(!game.isStart){
            if(lGame.my_uuid === game.owner_uuid){//Si el que solicita salir es el owner
                await this.gameModel.findByIdAndRemove(lGame._id).exec();
                //aca se deberia avisar al otro jugador.
            }
            else{
                //elimino el otro jugador
                await this.gameModel.findByIdAndUpdate(lGame._id, {$pull:{users_uuid: lGame.my_uuid}}).exec();
            }
        }
        else{
            //Finalizar
        }
        
     }
    }

    async findGame(uuid: string){
        return await this.gameModel.findById(uuid).exec();
    }
    //Solo el owner deberia empezar
    async startGame(sGame: CreateGameDto){
        let game = await this.findGame(sGame._id);
        if(game){
            if (game.users_uuid.length >= 2) {//TODO: que pasa si quiero hacer las partidas para mas de 2
                if(game.owner_uuid === sGame.my_uuid){
                    game.isStart = true;
                    game.users_uuid.forEach((element) =>{//Inicializo el array de las unidades
                        game.placedUnitList.push({owner_id: element, unitInfo:[]})
                    });
                    game.turn = game.owner_uuid;//Le asigno el turno al owner
                    game.gamePhase = gamePhase.PlaceUnits; //Momento de poner unidades
                    await this.gameModel.findByIdAndUpdate(game._id, game).exec();
                }
                else{
                    console.log('no sos el owner');
                    
                }
            }
            else{
                console.log('Por ahora no se puede jugar solo :(');
                
            }
        }
        else{
            console.log("no existe el juego");
        }
    }

    async addNewPiece(_id:string, re:string, idUnity:string){
        _id="db11859a-291e-43d7-a9a4-d651f2fa1bf1";
        let game = await this.findGame(_id);
        if(game){
            if (game.gamePhase === gamePhase.PlaceUnits) {
                if(game.isMyTurn(re)){
                    
                }
                else{
                    console.log("no es tu turno");
                    
                }
            }
        }

        //this.gameModel.findByIdAndUpdate(_id, {$push:{pieceList:{"", posX:12}}})
    }

    
}
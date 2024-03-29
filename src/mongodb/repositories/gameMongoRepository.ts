import { Game, GameDocument } from 'src/game/schemas/game.schema';
import { BaseMongoRepository } from './baseMongoRepository';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameMongoRepository extends BaseMongoRepository<Game> {
  constructor(@InjectModel(Game.name) private entity: Model<GameDocument>) {
    super(entity);
  }

  async getGamesByUser(gamesJoined: string[]) {
    return await this.entity.find().where('_id').in(gamesJoined).exec();
  }

  async getPublicGames(gamesJoined: string[]) {
    return await this.entity.find().where('isPublic').equals(true).where('_id').nin(gamesJoined).where('isStart').equals(false).exec();
  }
}

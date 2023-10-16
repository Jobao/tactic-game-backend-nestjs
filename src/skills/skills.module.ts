import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { MongodbService } from 'src/mongodb/mongodb.service';
import { MongodbModule } from 'src/mongodb/mongodb.module';
import { GameMongoRepository } from 'src/mongodb/repositories/gameMongoModel';

@Module({
  imports:[MongodbModule],
  providers: [SkillsService, MongodbService]
})
export class SkillsModule {}

import { Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { CreateUserDto } from './dto/createUser.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreateUnitDto } from 'src/unit/dto/createUnit.dto';
import { MongodbService } from 'src/mongodb/mongodb.service';
import { CacheService } from 'src/game-cache/cache.service';
import { Unit } from 'src/game/schemas/unit.schema';
import { UnitClasesService } from 'src/unit-clases/unit-clases.service';

@Injectable()
export class UserService {
  constructor(
    private mongoService: MongodbService,
    private cacheService: CacheService,
    private unitClassService: UnitClasesService,
  ) {}
  /**
   * NO llamar directamente de los controllers/gateway
   * Llamar auth.signup
   */
  async create(cUser: CreateUserDto) {
    let user = new User();
    user._id = cUser._id;
    user.user = cUser.user;
    user.displayName = cUser.displayName;
    return await this.mongoService.userRepository.create(user);
  }

  async findAll() {
    return await this.mongoService.userRepository.findAll();
  }

  async findOne(user_uuid: string) {
    return await this.mongoService.userRepository.findOne(user_uuid);
  }

  async update(uUser: User) {
    return await this.mongoService.userRepository.update(uUser._id, uUser);
  }

  async addNewUnit(cUnity: CreateUnitDto) {
    let usr = await this.cacheService.UserCache.getInCacheOrBD(
      cUnity.user_uuid,
    );
    if (usr) {
      let unit = new Unit();
      unit.classExperience = [];
      let uClass = this.unitClassService.canUseThisClass(cUnity.class_id, unit);
      if (uClass) {
        unit._id = uuidv4();
        unit.name = cUnity.name;
        unit.changeClass(uClass);
        usr.addUnit(unit);
        await this.cacheService.UserCache.setInCache(
          usr._id,
          await this.update(usr),
        );
      } else {
        console.log('CANT');
      }
    }
  }

  async removeUnit(user_uuid: string, unit_uuid: string) {
    let usr = await this.cacheService.UserCache.getInCacheOrBD(user_uuid);
    if (usr) {
      usr.removeUnit(unit_uuid);
      await this.cacheService.UserCache.setInCache(
        usr._id,
        await this.update(usr),
      );
    }
  }

  async removeAllUnits(user_uuid: string) {
    let usr = await this.cacheService.UserCache.getInCacheOrBD(user_uuid);
    if (usr) {
      usr.createdUnits = [];
      await this.cacheService.UserCache.setInCache(
        usr._id,
        await this.update(usr),
      );
    }
  }

  async leaveAllGames(usr: User) {
    let temp = usr.leaveAllGames();
    await this.cacheService.UserCache.setInCache(
      usr._id,
      await this.update(usr),
    );
    return temp;
  }

  async getUnit(user_uuid: string, unit_uuid: string) {
    const usr = await this.cacheService.UserCache.getInCacheOrBD(user_uuid);
    if (usr) {
      const unit = usr.getUnit(unit_uuid);
      if (unit) {
        return { status: 'OK', unit: unit };
      }
      return { status: 'FAIL' };
    }
    return { status: 'FAIL' };
  }
}

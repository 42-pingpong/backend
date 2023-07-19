import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    let user: User = null;
    //단일 transaction으로 처리
    await this.userRepository.manager.transaction(async (manager) => {
      user = await manager.findOne(User, {
        where: { id: createUserDto.id },
      });
      if (user) {
        return user;
      } else {
        return await manager.save(User, createUserDto);
      }
    });
    return user;
  }

  async findOne(id: number): Promise<User> {
    //단순 조회
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    await this.userRepository.manager.transaction(async (manager) => {
      //유저 조회
      const user = await manager.findOne(User, {
        where: { id: id },
      });
      if (!user) throw new NotFoundException(`User with id ${id} not found.`);

      //닉네임 중복 체크
      const dupNickNameUser = await manager.findOne(User, {
        where: { nickName: updateUserDto.nickName },
      });
      if (dupNickNameUser)
        throw new ConflictException(
          `Nickname ${updateUserDto.nickName} already exists.`,
        );

      //닉네임 변경
      await manager.update(User, id, updateUserDto);
    });
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager, Raw, Repository } from 'typeorm';
import { User } from 'src/entities/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'src/entities/auth/token.entity';
import { FriendsWith } from 'src/entities/user/friendsWith.entity';
import { GetFriendQueryDto } from './dto/get-friend-query.dto';
import { FriendRequest } from 'src/entities/user/friendRequest.entity';
import { InvitationStatus } from 'src/enum/invitation.enum';
import { SearchUserDto } from './dto/search-user.dto';
import { Like } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    @InjectRepository(FriendsWith)
    private friendsWithRepository: Repository<FriendsWith>,

    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.save(createUserDto);
  }

  async findOne(id: number): Promise<User> {
    //단순 조회
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (user) return user;
    else throw new NotFoundException();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    //이거 테스트코드 어케짬...?

    await this.userRepository.manager.transaction(
      async (manager: EntityManager) => {
        //유저 조회
        const user = await manager.findOne(User, {
          where: { id: id },
        });
        if (!user) throw new NotFoundException();

        //닉네임 중복 체크
        if (updateUserDto.nickName) {
          const dupNickNameUser = await manager.findOne(User, {
            where: { nickName: updateUserDto.nickName },
          });
          if (dupNickNameUser) throw new ConflictException();
        }

        //이메일 중복 체크
        if (updateUserDto.email) {
          const dupEmailUser = await manager.findOne(User, {
            where: { email: updateUserDto.email },
          });
          if (dupEmailUser) throw new ConflictException();
        }
        //닉네임 변경
        await manager.update(User, id, updateUserDto);
      },
    );
  }

  async getFriends(id: number, query: GetFriendQueryDto) {
    const quer = {
      relation: ['friendsWith'],
      where: {
        friendsWith: {
          friendId: id,
        },
      },
    };

    if (query.status && query.status !== 'all') {
      quer.where['status'] = query.status;
    }

    return await this.userRepository.find(quer);
  }

  async addFriend(id: number, friendId: number): Promise<void> {
    await this.friendsWithRepository.manager.transaction(
      async (manager: EntityManager) => {
        //유저 조회
        const user = await manager.findOne(User, {
          where: { id: id },
        });
        if (!user) throw new NotFoundException();

        //친구 조회
        const friend = await manager.findOne(User, {
          where: { id: friendId },
        });
        if (!friend) throw new NotFoundException();

        //친구 추가
        await manager.save(FriendsWith, {
          userId: id,
          friendId: friendId,
        });
        //친구 추가
        await manager.save(FriendsWith, {
          userId: friendId,
          friendId: id,
        });
      },
    );
  }

  async saveRequestFriend(id: number, friendId: number): Promise<void> {
    await this.friendRequestRepository.manager.transaction(
      async (manager: EntityManager) => {
        //유저 조회
        const user = await manager.findOne(User, {
          where: { id: id },
        });
        if (!user) throw new NotFoundException();

        //친구 조회
        const friend = await manager.findOne(User, {
          where: { id: friendId },
        });
        if (!friend) throw new NotFoundException();

        //친구 추가
        await manager.save(FriendRequest, {
          requestingUserId: id,
          requestedUserId: friendId,
          isAccepted: InvitationStatus.NOTALARMED,
        });
      },
    );
  }

  async searchUser(query: SearchUserDto): Promise<User[]> {
    const { nickName, email } = query;
    const where = {};
    if (nickName) where['nickName'] = Like(`%${nickName}%`);
    if (email) where['email'] = Like(`%${email}%`);
    return await this.userRepository.findBy(where);
  }
}

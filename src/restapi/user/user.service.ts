import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/entities/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'src/entities/auth/token.entity';
import { FriendsWith } from 'src/entities/user/friendsWith.entity';
import { GetFriendQueryDto } from './dto/get-friend-query.dto';
import { InvitationStatus } from 'src/enum/invitation.enum';
import { SearchUserDto } from './dto/search-user.dto';
import { Like } from 'typeorm';
import { Request, RequestType } from 'src/entities/user/request.entity';
import { GetUserResponseDto } from './response/get-alarm.response';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    @InjectRepository(FriendsWith)
    private friendsWithRepository: Repository<FriendsWith>,

    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
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
          userId: id,
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
    //친구 요청 대상자가 자기자신.
    if (id === friendId) throw new BadRequestException();

    await this.requestRepository.manager.transaction(
      async (manager: EntityManager) => {
        //친구 요청 중복 체크
        const isRequested = await manager.findOne(Request, {
          where: [
            {
              requestingUserId: id,
              requestedUserId: friendId,
              requestType: RequestType.FRIEND,
              isAccepted: InvitationStatus.PENDING,
            },
            {
              requestingUserId: id,
              requestedUserId: friendId,
              requestType: RequestType.FRIEND,
              isAccepted: InvitationStatus.NOTALARMED,
            },
          ],
        });
        if (isRequested) throw new ConflictException();

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

        //이미 친구인가
        const isFriend = await manager.findOne(FriendsWith, {
          where: { userId: id, friendId: friendId },
        });
        if (isFriend) throw new ConflictException();

        //친구 요청 저장
        await manager.save(Request, {
          requestingUserId: id,
          requestedUserId: friendId,
          isAccepted: InvitationStatus.NOTALARMED,
          requestType: RequestType.FRIEND,
        });
      },
    );
  }

  async searchUser(query: SearchUserDto): Promise<User[]> {
    const { nickName } = query;
    const where = {};
    if (nickName) {
      where['nickName'] = Like(`%${nickName}%`);
      return await this.userRepository.findBy(where);
    }
  }

  /**
   * @Todo test
   * */
  async getAlarms(id: number) {
    const res: GetUserResponseDto[] = await this.requestRepository.find({
      relations: { requestingUser: true },
      where: {
        requestedUserId: id,
      },
      order: {
        createdAt: 'DESC',
      },
      select: {
        requestId: true,
        requestingUser: {
          id: true,
          nickName: true,
        },
        requestType: true,
        isAccepted: true,
        createdAt: true,
      },
    });

    //알람 시간 계산
    const curTime = new Date();
    res.forEach((alarm) => {
      const diff = curTime.getTime() - alarm.createdAt.getTime();
      const diffSec = Math.floor(diff / 1000);
      if (diffSec < 60) {
        alarm.pastTime = `${diffSec}초 전`;
      } else if (diffSec < 3600) {
        alarm.pastTime = `${Math.floor(diffSec / 60)}분 전`;
      } else if (diffSec < 86400) {
        alarm.pastTime = `${Math.floor(diffSec / 3600)}시간 전`;
      } else {
        alarm.pastTime = `${Math.floor(diffSec / 86400)}일 전`;
      }
    });
    return res;
  }
}

import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  PrimaryColumn,
  Unique,
  Index,
} from 'typeorm';
import { Token } from './token.entity';
import { DirectMessage } from './directMessage.entity';
import { GroupChat } from './groupChat.entity';
import { MessageInfo } from './messageInfo.entity';
import { GameScore } from './gameScore.entity';
import { BlockUserList } from './blockUserList.entity';
import { FriendsWith } from './friendsWith.entity';
import { Request } from './request.entity';
import { MutedUserJoin } from './mutedUserJoin.entity';

@Entity()
@Unique(['nickName'])
@Unique(['email'])
@Index(['status'])
//postgresql에서는 index 기본적으로 btree.
//https://www.postgresql.org/docs/current/indexes-types.html
export class User {
  @PrimaryColumn({
    comment: '유저의 아이디(인트라 아이디)',
  })
  id: number;

  @Column({
    type: 'float',
  })
  level: number;

  @Column({
    type: 'varchar',
    length: 200,
  })
  profile: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  nickName: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 400,
  })
  selfIntroduction: string;

  @Column({
    type: 'int',
    default: 0,
    nullable: true,
  })
  emailCode: number;

  /**
   * user의 현재 상태
   * 0: offline
   * 1: online
   * 2: in game
   * */
  @Column({
    type: 'enum',
    enum: ['offline', 'online', 'inGame'],
    default: 'online',
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  statusSocketId: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  chatSocketId: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  gameSocketId: string;

  @OneToMany(() => GroupChat, (groupChat) => groupChat.owner)
  groupChats: GroupChat[];

  @ManyToMany(() => GroupChat, (groupChat) => groupChat.bannedUsers)
  bannedGroupChats: GroupChat[];

  @ManyToMany(() => GroupChat, (groupChat) => groupChat.admin)
  adminingGroupChats: GroupChat[];

  @ManyToMany(() => GroupChat, (groupChat) => groupChat.joinedUser)
  joinedGroupChats: GroupChat[];

  @OneToMany(() => FriendsWith, (friendsWith) => friendsWith.friend)
  friendsWith: FriendsWith[];

  @OneToMany(() => MessageInfo, (messageInfo) => messageInfo.sender)
  messages: MessageInfo[];

  @OneToMany(() => DirectMessage, (directMessage) => directMessage.receivedUser)
  directMessages: DirectMessage;

  @OneToMany(() => Request, (request) => request.requestingUser)
  requesting: Request[];

  @OneToMany(() => Request, (request) => request.requestedUser)
  requested: Request[];

  @OneToMany(() => BlockUserList, (blockUserList) => blockUserList.user)
  blockList: BlockUserList[];

  @OneToMany(() => BlockUserList, (blockUserList) => blockUserList.BlockedUser)
  blockedList: BlockUserList[];

  @OneToMany(() => GameScore, (gameScore) => gameScore.userId)
  gameScores: GameScore[];

  @OneToMany(() => Token, (Token) => Token.owner)
  tokens: Token[];

  @OneToMany(() => MutedUserJoin, (mutedUsersJoin) => mutedUsersJoin.mutedUser)
  mutedUsers: MutedUserJoin[];
}

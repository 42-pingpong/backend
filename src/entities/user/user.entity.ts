import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  PrimaryColumn,
  JoinTable,
  Unique,
} from 'typeorm';
import { Token } from '../auth/token.entity';
import { DirectMessage } from '../chat/directMessage.entity';
import { GroupChat } from '../chat/groupChat.entity';
import { MessageInfo } from '../chat/messageInfo.entity';
import { GameInvitation } from '../game/gameInvitation.entity';
import { GameScore } from '../game/gameScore.entity';
import { BlockUserList } from './blockUserList.entity';
import { FriendsOf } from './friendsOf.entity';
import { FriendRequest } from './friendRequest.entity';
import { FriendsWith } from './friendsWith.entity';

@Entity()
@Unique(['nickName'])
@Unique(['email'])
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

  /**
   * user의 현재 상태
   * 0: offline
   * 1: online
   * 2: in game
   * */
  @Column({
    type: 'enum',
    enum: ['offline', 'online', 'in game'],
    default: 'online',
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  socketId: string;

  @OneToMany(() => GroupChat, (groupChat) => groupChat.owner)
  groupChats: GroupChat[];

  @ManyToMany(() => GroupChat, (groupChat) => groupChat.bannedUser)
  bannedGroupChats: GroupChat[];

  @ManyToMany(() => GroupChat, (groupChat) => groupChat.admin)
  adminingGroupChats: GroupChat[];

  @ManyToMany(() => GroupChat, (groupChat) => groupChat.joinedUser)
  joinedGroupChats: GroupChat[];

  @OneToMany(() => FriendsWith, (friendsWith) => friendsWith.user)
  friendsWith: FriendsWith[];

  @OneToMany(() => FriendsOf, (friendsOf) => friendsOf.user)
  friendsOf: FriendsOf[];

  @OneToMany(() => MessageInfo, (messageInfo) => messageInfo.sender)
  messages: MessageInfo[];

  @OneToMany(
    () => DirectMessage,
    (directMessage) => directMessage.receivedUserId,
  )
  directMessages: DirectMessage;

  @OneToMany(
    () => FriendRequest,
    (friendRequest) => friendRequest.requestedUser,
  )
  friendRequesting: FriendRequest;

  @OneToMany(
    () => FriendRequest,
    (friendRequest) => friendRequest.requestedUser,
  )
  friendRequested: FriendRequest;

  @OneToMany(() => BlockUserList, (blockUserList) => blockUserList.blockUserId)
  blockList: BlockUserList[];

  @OneToMany(
    () => BlockUserList,
    (blockUserList) => blockUserList.blockedUserId,
  )
  blockedList: BlockUserList[];

  @OneToMany(() => GameScore, (gameScore) => gameScore.userId)
  gameScores: GameScore[];

  @OneToMany(() => GameInvitation, (gameInvitation) => gameInvitation.inviteeId)
  invitedGame: GameInvitation[];

  @OneToMany(() => GameInvitation, (gameInvitation) => gameInvitation.inviterId)
  invitingGame: GameInvitation[];

  @OneToMany(() => Token, (Token) => Token.owner)
  tokens: Token[];
}

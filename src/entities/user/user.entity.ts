import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  PrimaryColumn,
  JoinTable,
} from 'typeorm';
import { DirectMessage } from '../chat/directMessage.entity';
import { GroupChat } from '../chat/groupChat.entity';
import { MessageInfo } from '../chat/messageInfo.entity';
import { GameInvitation } from '../game/gameInvitation.entity';
import { GameScore } from '../game/gameScore.entity';
import { BlockUserList } from './blockUserList.entity';
import { FriendRequest } from './friendRequest.entity';

@Entity()
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
    length: 100,
  })
  profile: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  nickName: string;

  @Column({
    type: 'varchar',
    length: 400,
  })
  selfIntroduction: string;

  @OneToMany(() => GroupChat, (groupChat) => groupChat.owner)
  groupChats: GroupChat[];

  @ManyToMany(() => GroupChat, (groupChat) => groupChat.bannedUser)
  bannedGroupChats: GroupChat[];

  @ManyToMany(() => GroupChat, (groupChat) => groupChat.admin)
  adminingGroupChats: GroupChat[];

  @ManyToMany(() => GroupChat, (groupChat) => groupChat.joinedUser)
  joinedGroupChats: GroupChat[];

  @ManyToMany(() => User, (user) => user.friendOf)
  @JoinTable()
  friendsWith: User[];

  @ManyToMany(() => User, (user) => user.friendsWith)
  @JoinTable()
  friendOf: User[];

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
}

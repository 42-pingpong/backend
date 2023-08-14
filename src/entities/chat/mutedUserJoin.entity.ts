import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { GroupChat } from './groupChat.entity';

export class MutedUserJoin {
  @ManyToOne(() => User, (user) => user.mutedUsers)
  @JoinColumn({
    name: 'mutedUserId',
  })
  mutedUser: User;

  @Column({
    type: 'int',
  })
  mutedUserId: number;

  @ManyToOne(() => GroupChat, (groupChat) => groupChat.mutedUsers)
  @JoinColumn({
    name: 'mutedGroupId',
  })
  mutedGroup: GroupChat;

  @Column({
    type: 'int',
  })
  mutedGroupId: number;

  @Column({
    type: 'timestamp',
  })
  muteDue: Date;
}

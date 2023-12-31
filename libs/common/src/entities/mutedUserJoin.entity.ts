import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';
import { User } from '@app/common/entities/user.entity';
import { GroupChat } from '@app/common/entities/groupChat.entity';

@Index(['mutedUserId', 'mutedGroupId'], { unique: true })
@Entity()
export class MutedUserJoin {
  @PrimaryGeneratedColumn()
  id: number;

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
    type: 'timestamp with time zone',
  })
  muteDue: Date;
}

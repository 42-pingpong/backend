import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '@app/common/entities/user.entity';
import { GroupChatMessage } from '@app/common/entities/groupChatMessage.entity';
import { MutedUserJoin } from '@app/common/entities/mutedUserJoin.entity';

@Entity()
export class GroupChat {
  @PrimaryGeneratedColumn()
  groupChatId: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  chatName: string;

  @Column({
    type: 'enum',
    enum: ['Pub', 'Prot'],
  })
  levelOfPublicity: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    select: false,
  })
  password: string;

  @Column({
    type: 'int',
  })
  maxParticipants: number;

  @Column({
    type: 'int',
    default: 1,
  })
  curParticipants: number;

  @ManyToOne(() => User, (user) => user.groupChats)
  @JoinColumn({
    name: 'ownerId',
  })
  owner: User;

  @Column({
    type: 'int',
  })
  ownerId: number;

  @DeleteDateColumn()
  isDeleted: Date | null;

  @ManyToMany(() => User, (user) => user.bannedGroupChats, { cascade: true })
  @JoinTable({
    name: 'BannedGroupChat_user_joinTable',
  })
  bannedUsers: User[];

  @ManyToMany(() => User, (user) => user.adminingGroupChats, { cascade: true })
  @JoinTable({
    name: 'GroupChatAdmin_user_joinTable',
  })
  admin: User[];

  @ManyToMany(() => User, (user) => user.joinedGroupChats, { cascade: true })
  @JoinTable({
    name: 'GroupChat_user_joinTable',
  })
  joinedUser: User[];

  @OneToMany(
    () => GroupChatMessage,
    (groupChatMessage) => groupChatMessage.receivedGroupChatId,
  )
  groupChatMessages: GroupChatMessage[];

  @OneToMany(() => MutedUserJoin, (mutedUsersJoin) => mutedUsersJoin.mutedGroup)
  mutedUsers: MutedUserJoin[];
}

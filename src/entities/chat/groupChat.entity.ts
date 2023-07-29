import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { GroupChatMessage } from './groupChatMessage.entity';

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
    enum: ['Pub', 'Priv'],
  })
  levelOfPublicity: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  password: string;

  @Column({
    type: 'bigint',
  })
  maxParticipants: number;

  @Column({
    type: 'bigint',
    default: 0,
  })
  curParticipants: number;

  @ManyToOne(() => User, (user) => user.groupChats)
  @JoinColumn()
  owner: User;

  @Column({
    type: 'int',
  })
  ownerId: number;

  @ManyToMany(() => User, (user) => user.bannedGroupChats)
  @JoinTable({
    name: 'BannedGroupChat_user_joinTable',
  })
  bannedUser: User[];

  @ManyToMany(() => User, (user) => user.adminingGroupChats)
  @JoinTable({
    name: 'GroupChatAdmin_user_joinTable',
  })
  admin: User[];

  @ManyToMany(() => User, (user) => user.joinedGroupChats)
  @JoinTable({
    name: 'GroupChat_user_joinTable',
  })
  joinedUser: User[];

  @OneToMany(
    () => GroupChatMessage,
    (groupChatMessage) => groupChatMessage.receivedGroupChatId,
  )
  groupChatMessages: GroupChatMessage[];
}

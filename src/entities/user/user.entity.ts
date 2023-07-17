import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  PrimaryColumn,
  JoinTable,
} from 'typeorm';
import { GroupChat } from '../chat/groupChat.entity';

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
    length: 14,
  })
  phone: string;

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
}

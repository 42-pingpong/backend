import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class GroupChat {
  @PrimaryGeneratedColumn()
  groupChatId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ['Pub', 'Priv'],
  })
  levelOfPublicity: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  password: string;

  @Column({
    type: 'bigint',
  })
  maxParticipants: number;

  @ManyToOne(() => User, (user) => user.groupChats)
  owner: User;

  @ManyToMany(() => User, (user) => user.bannedGroupChats)
  @JoinTable()
  bannedUser: User[];

  @ManyToMany(() => User, (user) => user.adminingGroupChats)
  @JoinTable()
  admin: User[];

  @ManyToMany(() => User, (user) => user.joinedGroupChats)
  @JoinTable()
  joinedUser: User[];
}

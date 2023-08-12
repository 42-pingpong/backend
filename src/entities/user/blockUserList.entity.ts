import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BlockUserList {
  @PrimaryGeneratedColumn()
  blockUserListid: number;

  @ManyToOne(() => User, (user) => user.blockList)
  @JoinColumn({ name: 'blockUserId' })
  BlockUser: User;

  @Column({
    type: 'int',
  })
  blockUserId: number;

  @ManyToOne(() => User, (user) => user.blockedList)
  @JoinColumn({ name: 'blockedUserId' })
  BlockedUser: User;

  @Column({
    type: 'int',
  })
  blockedUserId: number;
}

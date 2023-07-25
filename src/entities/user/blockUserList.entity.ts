import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BlockUserList {
  @PrimaryGeneratedColumn()
  blockUserListid: number;

  @ManyToOne(() => User, (user) => user.blockList)
  @JoinColumn()
  blockUserId: number;

  @ManyToOne(() => User, (user) => user.blockedList)
  @JoinColumn()
  blockedUserId: number;
}

import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BlockUserList {
  @PrimaryGeneratedColumn()
  blockUserListid: number;

  @ManyToOne(() => User, (user) => user.blockList)
  blockUserId: number;

  @ManyToOne(() => User, (user) => user.blockedList)
  blockedUserId: number;
}

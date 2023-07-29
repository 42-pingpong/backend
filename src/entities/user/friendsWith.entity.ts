import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FriendsWith {
  @ManyToOne(() => User, (user) => user.friendsWith)
  @JoinColumn({ name: 'userId' })
  user: User;

  @PrimaryColumn({
    type: 'int',
  })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'friendId' })
  friend: User;

  @PrimaryColumn({
    type: 'int',
  })
  friendId: number;
}

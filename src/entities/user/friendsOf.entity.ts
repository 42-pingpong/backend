import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FriendsOf {
  @ManyToOne(() => User, (user) => user.friendsOf)
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

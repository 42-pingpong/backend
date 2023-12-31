import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FriendsWith {
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @PrimaryColumn({
    type: 'int',
  })
  userId: number;

  @ManyToOne(() => User, (user) => user.friendsWith)
  @JoinColumn({ name: 'friendId' })
  friend: User;

  @PrimaryColumn({
    type: 'int',
  })
  friendId: number;
}

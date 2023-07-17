import { InvitationStatus } from 'src/enum/invitation.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn()
  friendRequestId: number;

  @ManyToOne(() => User, (user) => user.friendRequested)
  requestedUser: User;

  @ManyToOne(() => User, (user) => user.friendRequesting)
  requestingUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  isAccepted: InvitationStatus;
}

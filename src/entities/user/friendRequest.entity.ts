import { InvitationStatus } from 'src/enum/invitation.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn()
  friendRequestId: number;

  @ManyToOne(() => User, (user) => user.friendRequesting)
  @JoinColumn()
  requestingUser: User;

  @Column()
  requestingUserId: number;

  @ManyToOne(() => User, (user) => user.friendRequested)
  @JoinColumn()
  requestedUser: User;

  @Column()
  requestedUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.NOTALARMED,
  })
  isAccepted: InvitationStatus;
}

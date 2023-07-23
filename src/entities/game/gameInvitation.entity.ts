import { InvitationStatus } from 'src/enum/invitation.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class GameInvitation {
  @PrimaryGeneratedColumn()
  invitationId: number;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  isAccepted: InvitationStatus;

  @ManyToOne(() => User, (user) => user.invitingGame)
  @JoinColumn()
  inviterId: number;

  @ManyToOne(() => User, (user) => user.invitedGame)
  @JoinColumn()
  inviteeId: number;
}

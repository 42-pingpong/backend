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

export enum RequestType {
  FRIEND = 'F',
  GAME = 'G',
  CHAT = 'C',
}

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  requestId: number;

  @ManyToOne(() => User, (user) => user.requesting)
  @JoinColumn()
  requestingUser: User;

  @Column()
  requestingUserId: number;

  @ManyToOne(() => User, (user) => user.requested)
  @JoinColumn()
  requestedUser: User;

  @Column()
  requestedUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: RequestType,
  })
  requestType: RequestType;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.NOTALARMED,
  })
  isAccepted: InvitationStatus;
}

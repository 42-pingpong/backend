import { InvitationStatus } from '@app/common/enum/invitation.enum';
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
  FRIEND = 'F', // 친구 알림
  GAME = 'G', // 게임 초대 요청
  DMCHAT = 'D', // DM 채팅 알림
  GROUPCHAT = 'C', // 그룹 채팅 알림
}

export enum AlarmStatus {
  NOTALARMED = 'N',
  ALARMED = 'A',
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
    default: InvitationStatus.PENDING,
  })
  isAccepted: InvitationStatus;

  @Column({
    type: 'enum',
    enum: AlarmStatus,
    default: AlarmStatus.NOTALARMED,
  })
  isAlarmed: AlarmStatus;
}

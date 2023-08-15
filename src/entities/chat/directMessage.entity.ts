import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '../user/user.entity';
import { MessageInfo } from './messageInfo.entity';

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn()
  directMessageId: number;

  @OneToOne(() => MessageInfo, (messageInfo) => messageInfo.directMessage)
  @JoinColumn({ name: 'messageInfoId' })
  messageInfo: MessageInfo;

  @Column({
    type: 'int',
  })
  messageInfoId: number;

  @ManyToOne(() => User, (user) => user.directMessages)
  @JoinColumn({ name: 'receivedUserId' })
  receivedUser: User;

  @Column({
    type: 'int',
  })
  receivedUserId: number;
}

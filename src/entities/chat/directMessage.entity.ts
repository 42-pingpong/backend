import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { MessageInfo } from './messageInfo.entity';

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn()
  directMessageId: number;

  @OneToOne(() => MessageInfo, (messageInfo) => messageInfo.directMessage)
  @JoinColumn({
    name: 'messageInfoId',
  })
  messageInfoId: number;

  @ManyToOne(() => User, (user) => user.directMessages)
  @JoinColumn()
  receivedUserId: number;
}

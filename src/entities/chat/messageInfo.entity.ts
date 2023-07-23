import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { DirectMessage } from './directMessage.entity';
import { GroupChatMessage } from './groupChatMessage.entity';

@Entity()
export class MessageInfo {
  @PrimaryGeneratedColumn()
  messageId: number;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn()
  sender: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'varchar',
    length: 400,
  })
  message: string;

  @Column({
    type: 'bigint',
    default: 1,
  })
  isRead: number;

  @OneToOne(
    () => GroupChatMessage,
    (groupChatMessage) => groupChatMessage.messageInfo,
  )
  groupChatMessage: GroupChatMessage;

  @OneToOne(() => DirectMessage, (directMessage) => directMessage.messageInfoId)
  directMessage: DirectMessage;
}

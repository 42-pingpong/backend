import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DirectMessage } from './directMessage.entity';
import { GroupChatMessage } from './groupChatMessage.entity';

@Entity()
export class MessageInfo {
  @PrimaryGeneratedColumn()
  messageId: number;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'senderId' })
  sender: User;
  @Column({
    type: 'int',
  })
  senderId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'varchar',
    length: 400,
  })
  message: string;

  @OneToOne(
    () => GroupChatMessage,
    (groupChatMessage) => groupChatMessage.messageInfo,
  )
  groupChatMessage: GroupChatMessage;

  @OneToOne(() => DirectMessage, (directMessage) => directMessage.messageInfoId)
  directMessage: DirectMessage;
}

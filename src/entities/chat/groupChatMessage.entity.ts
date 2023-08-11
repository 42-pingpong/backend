import {
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { MessageInfo } from './messageInfo.entity';
import { GroupChat } from './groupChat.entity';

@Entity()
export class GroupChatMessage {
  @PrimaryGeneratedColumn()
  groupChatMessageId: number;

  @OneToOne(() => MessageInfo, (messageInfo) => messageInfo.groupChatMessage)
  @JoinColumn({ name: 'messageInfoId' })
  messageInfo: MessageInfo;

  @Column({
    type: 'int',
  })
  messageInfoId: number;

  @ManyToOne(() => GroupChat, (groupChat) => groupChat.groupChatMessages)
  @JoinColumn({ name: 'receivedGroupChatId' })
  receivedGroupChat: GroupChat;

  @Column({
    type: 'int',
  })
  receivedGroupChatId: number;
}

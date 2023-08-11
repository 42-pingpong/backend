import {
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { MessageInfo } from './messageInfo.entity';
import { GroupChat } from './groupChat.entity';

@Entity()
export class GroupChatMessage {
  @PrimaryGeneratedColumn()
  groupChatMessageId: number;

  @OneToOne(() => MessageInfo, (messageInfo) => messageInfo.groupChatMessage)
  messageInfo: MessageInfo;

  @Column({
    type: 'int',
  })
  messageInfoId: number;

  @ManyToOne(() => GroupChat, (groupChat) => groupChat.groupChatMessages)
  receivedGroupChat: GroupChat;

  @Column({
    type: 'int',
  })
  receivedGroupChatId: number;
}

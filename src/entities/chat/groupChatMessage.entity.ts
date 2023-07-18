import {
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MessageInfo } from './messageInfo.entity';
import { GroupChat } from './groupChat.entity';

@Entity()
export class GroupChatMessage {
  @PrimaryGeneratedColumn()
  groupChatMessageId: number;

  @OneToOne(() => MessageInfo, (messageInfo) => messageInfo.groupChatMessage)
  @JoinColumn({
    name: 'messageInfoId',
  })
  messageInfo: MessageInfo;

  @ManyToOne(() => GroupChat, (groupChat) => groupChat.groupChatMessages)
  receivedGroupChatId: GroupChat;
}

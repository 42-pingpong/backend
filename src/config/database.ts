import { registerAs } from '@nestjs/config';
import { User } from 'src/entities/user/user.entity';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { GroupChatMessage } from 'src/entities/chat/groupChatMessage.entity';
import { DirectMessage } from 'src/entities/chat/directMessage.entity';
import { MessageInfo } from 'src/entities/chat/messageInfo.entity';
import { GameInfo } from 'src/entities/game/gameInfo.entity';
import { GameInvitation } from 'src/entities/game/gameInvitation.entity';
import { GameScore } from 'src/entities/game/gameScore.entity';
import { BlockUserList } from 'src/entities/user/blockUserList.entity';
import { FriendRequest } from 'src/entities/user/friendRequest.entity';
import { Token } from 'src/entities/auth/token.entity';

export default registerAs('database', () => ({
  host: process.env.POSTGRES_DBHOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [
    User,
    GroupChat,
    GroupChatMessage,
    DirectMessage,
    MessageInfo,
    GameInfo,
    GameInvitation,
    GameScore,
    BlockUserList,
    FriendRequest,
    Token,
  ],
  synchronize:
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'e2e' ||
    process.env.NODE_ENV === 'test'
      ? true //true for dev
      : false,
  dropSchema:
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'e2e' ||
    process.env.NODE_ENV === 'test'
      ? false //true for dev
      : false,
  logging:
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'e2e' ||
    process.env.NODE_ENV === 'test'
      ? 'all'
      : false,
}));

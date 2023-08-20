import { registerAs } from '@nestjs/config';
import { GroupChat } from '@app/common/entities/groupChat.entity';
import { GroupChatMessage } from '@app/common/entities/groupChatMessage.entity';
import { User } from '@app/common/entities/user.entity';
import { DirectMessage } from '@app/common/entities/directMessage.entity';
import { MessageInfo } from '@app/common/entities/messageInfo.entity';
import { GameInfo } from '@app/common/entities/gameInfo.entity';
import { GameScore } from '@app/common/entities/gameScore.entity';
import { BlockUserList } from '@app/common/entities/blockUserList.entity';
import { Token } from '@app/common/entities/token.entity';
import { FriendsWith } from '@app/common/entities/friendsWith.entity';
import { Request } from '@app/common/entities/request.entity';
import { MutedUserJoin } from '@app/common/entities/mutedUserJoin.entity';

export default registerAs('database', () => ({
  host:
    process.env.NODE_ENV === 'test' ? 'localhost' : process.env.POSTGRES_DBHOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [
    MutedUserJoin,
    User,
    GroupChat,
    GroupChatMessage,
    DirectMessage,
    MessageInfo,
    GameInfo,
    GameScore,
    BlockUserList,
    Request,
    Token,
    FriendsWith,
  ],
  synchronize:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? true //true for dev
      : false,
  dropSchema:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? true //true for dev
      : false,
  logging:
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'e2e' ||
    process.env.NODE_ENV === 'test'
      ? true
      : false,
}));

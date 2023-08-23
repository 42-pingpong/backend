import { DataSource } from 'typeorm';
import { ChatFactory } from '@app/common/factory/chat.factory';
import { CreateGroupChatDto } from '../../apps/restapis/src/chat/dto/create-group-chat.dto';
import { GroupChat } from '@app/common/entities/groupChat.entity';

async function privGroupChatSeed(
  dataSource: DataSource,
  chatFactory: ChatFactory,
  chatId: number,
  realIds: number[],
) {
  for (const id of realIds) {
    const createDto: CreateGroupChatDto = chatFactory.createPrivChat(
      id,
      chatId++,
    );
    await dataSource.getRepository(GroupChat).save(createDto);
  }
}

async function pubGroupChatSeed(
  dataSource: DataSource,
  chatFactory: ChatFactory,
  chatId: number,
  realIds: number[],
) {
  for (const id of realIds) {
    const createDto: CreateGroupChatDto = chatFactory.createPubChat(
      id,
      chatId++,
    );
    await dataSource.getRepository(GroupChat).save(createDto);
  }
}

export default async function chatSeeder(dataSource: DataSource) {
  const chatFactory = new ChatFactory();
  const realIds = [107112, 106987, 106982, 106930];
  let i = 1;

  //create pub chat
  await pubGroupChatSeed(dataSource, chatFactory, i, realIds);

  i += realIds.length;
  //create priv chat
  await privGroupChatSeed(dataSource, chatFactory, i, realIds);
}

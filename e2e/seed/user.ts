import { User } from '@app/common/entities/user.entity';
import { FriendsWith } from '@app/common/entities/friendsWith.entity';
import { CreateUserDto } from '../../apps/restapis/src/user/dto/create-user.dto';
import { UserFactory } from '@app/common/factory/user.factory';
import { DataSource } from 'typeorm';

/**
 * @brief create real users
 *
 * @param DataSource
 *
 * @return
 */
async function realUserSeeding(dataSource: DataSource) {
  const myukang = new CreateUserDto();

  myukang.id = 106987;
  myukang.nickName = 'myukang';
  myukang.email = 'myukang';
  myukang.fullName = 'myukang';
  myukang.profile = 'https://cdn.intra.42.fr/users/myukang.jpg';
  myukang.selfIntroduction = 'test';
  myukang.level = 1;
  myukang.status = 'offline';
  await dataSource.getRepository(User).save(myukang);

  const jinkim = new CreateUserDto();

  jinkim.id = 107112;
  jinkim.nickName = 'jinkim';
  jinkim.email = 'jinkim';
  jinkim.fullName = 'jinkim';
  jinkim.profile = 'https://cdn.intra.42.fr/users/jinkim.jpg';
  jinkim.selfIntroduction = 'test';
  jinkim.level = 1;
  jinkim.status = 'offline';
  await dataSource.getRepository(User).save(jinkim);

  const gyumpark = new CreateUserDto();
  gyumpark.id = 106982;
  gyumpark.nickName = 'gyumpark';
  gyumpark.email = 'gyumpark';
  gyumpark.fullName = 'gyumpark';
  gyumpark.profile = 'https://cdn.intra.42.fr/users/gyumpark.jpg';
  gyumpark.selfIntroduction = 'test';
  gyumpark.level = 1;
  gyumpark.status = 'offline';
  await dataSource.getRepository(User).save(gyumpark);

  const soo = new CreateUserDto();

  soo.id = 106930;
  soo.nickName = 'soo';
  soo.email = 'soo';
  soo.fullName = 'soo';
  soo.profile = 'https://cdn.intra.42.fr/users/soo.jpg';
  soo.selfIntroduction = 'test';
  soo.level = 1;
  soo.status = 'offline';
  await dataSource.getRepository(User).save(soo);
}

/**
 * @brief create fake users
 *
 * @param DataSource
 * @param number of users to create
 *
 * @return
 */
async function fakeUserSeeding(dataSource: DataSource, qt: number) {
  const userFactory = new UserFactory();
  for (let i = 1; i < qt + 1; i++) {
    const user = userFactory.createUser(i);
    user.status = 'offline';
    await dataSource.getRepository(User).save(user);
  }
}

async function fakeFriendsSeeding(
  dataSource: DataSource,
  qt: number,
  realIds: number[],
) {
  for (const id of realIds) {
    for (let i = 1; i < qt + 1; i++) {
      await dataSource.getRepository(FriendsWith).save({
        userId: id,
        friendId: i,
      });
      await dataSource.getRepository(FriendsWith).save({
        userId: i,
        friendId: id,
      });
    }
  }
}

async function realFriendsSeeding(dataSource: DataSource, realIds: number[]) {
  const realIdSet = new Set(realIds);

  for (const id of realIds) {
    const newSet = new Set(realIdSet);
    newSet.delete(id);
    console.log('newset:', newSet);
    const arr = Array.from(newSet);
    for (const friendId of arr) {
      console.log(friendId, id);
      const sav = await dataSource.getRepository(FriendsWith).save({
        userId: id,
        friendId: friendId,
      });
      const sav2 = await dataSource.getRepository(FriendsWith).save({
        userId: friendId,
        friendId: id,
      });
      console.log(sav, sav2);
    }
  }
}

/**
 * @brief user data seed
 *
 * @param DataSource
 *
 * @return
 */
export default async function userSeeder(dataSource: DataSource) {
  const realIds = [107112, 106987, 106982, 106930];
  const qt = 10;
  await realUserSeeding(dataSource);
  await fakeUserSeeding(dataSource, qt);
  await fakeFriendsSeeding(dataSource, qt, realIds);
  await realFriendsSeeding(dataSource, realIds);
}

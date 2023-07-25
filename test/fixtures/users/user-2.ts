import { User } from 'src/entities/user/user.entity';

/**
 * @brief user used in PATCH /user/{id} test
 * @return
 * user2.id = 2;
 * user2.nickName = 'newUser';
 * user2.level = 5.5;
 * user2.profile = 'ttt';
 * user2.fullName = 'fullName';
 * user2.email = 'newEmail';
 * user2.selfIntroduction = '00';
 */
export const user2 = new User();
user2.id = 2;
user2.nickName = 'newUser';
user2.level = 5.5;
user2.profile = 'ttt';
user2.fullName = 'fullName';
user2.email = 'newEmail';
user2.selfIntroduction = '00';

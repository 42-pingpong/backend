import { User } from 'src/entities/user/user.entity';

/**
 * @brief user used in Auth test.
 * @description have valid tokens
 * @returns
 * user3.id = 3;
 * user3.nickName = 'loginUser';
 * user3.level = 5.5;
 * user3.profile = 'ttt';
 * user3.fullName = 'fullName';
 * user3.email = 'loginEmail';
 * user3.selfIntroduction = '00';
 * */
export const user3 = new User();
user3.id = 3;
user3.nickName = 'loginUser';
user3.level = 5.5;
user3.profile = 'ttt';
user3.fullName = 'fullName';
user3.email = 'loginEmail';
user3.selfIntroduction = '00';

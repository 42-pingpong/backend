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
user3.nickName = 'loginUser3';
user3.level = 5.5;
user3.profile = 'ttt';
user3.fullName = 'fullName';
user3.email = 'loginEmail3';
user3.selfIntroduction = '00';

export const user4 = new User();
user4.id = 4;
user4.nickName = 'loginUser4';
user4.level = 5.5;
user4.profile = 'ttt';
user4.fullName = 'fullName';
user4.email = 'loginEmail4';
user4.selfIntroduction = '00';

export const user5 = new User();
user4.id = 5;
user4.nickName = 'loginUser6';
user4.level = 5.5;
user4.profile = 'ttt';
user4.fullName = 'fullName';
user4.email = 'loginEmail5';
user4.selfIntroduction = '00';

import { User } from 'src/entities/user/user.entity';

/**
 * @brief user used in GET/user/{id} test
 * @return
 * user1.id = 1;
 * user1.nickName = 'test';
 * user1.level = 5.5;
 * user1.profile = 'ttt';
 * user1.fullName = 'fullName';
 * user1.email = 'defualtEmail';
 * user1.selfIntroduction = '00';
 */
export const user1 = new User();
user1.id = 1;
user1.nickName = 'test';
user1.level = 5.5;
user1.profile = 'ttt';
user1.fullName = 'fullName';
user1.email = 'defualtEmail';
user1.selfIntroduction = '00';

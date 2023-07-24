/**
 * @brief 유저 인터페이스
 * @description 유저의 정보를 담는 인터페이스
 *
 * @param id: 유저의 id
 * @param level: 유저의 레벨
 * @param nickName: 유저의 닉네임
 * @param selfIntroduction: 유저의 자기소개
 * @param profile: 유저의 프로필 사진
 * @param email: 유저의 이메일
 *
 */
export interface jwtPayload extends IUser, accTokenPayload {}

export interface accTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface IUser {
  id?: number;
  fullName?: string;
  level?: number;
  nickName?: string;
  selfIntroduction?: string;
  profile?: string;
  email?: string;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 200,
  })
  refreshToken: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment:
      'if the last access token is not same with this token, then this token is not valid',
  })
  accessToken: string;

  @Column({
    type: 'int',
  })
  @ManyToOne(() => User, (user) => user.refreshTokens)
  userId: User;
}

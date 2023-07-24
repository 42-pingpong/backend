import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
@Index(['owner'])
export class Token {
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

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn()
  owner: User;
}

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.getSalt(10);
    return await bcrypt.hash(password, salt);
  }
}

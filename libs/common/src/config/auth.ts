import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  access_secret: process.env.JWT_ACCESS_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
}));

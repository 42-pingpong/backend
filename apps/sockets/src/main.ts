import { NestFactory } from '@nestjs/core';
import { RedisIoAdapter } from '@app/common/adaptor/redis-socket.adaptor';
import { SocketModule } from './sockets.module';

async function bootstrap() {
  const app = await NestFactory.create(SocketModule);

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(process.env.NEST_PORT);
}
bootstrap();

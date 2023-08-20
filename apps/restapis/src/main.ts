import { NestFactory } from '@nestjs/core';
import { RestapiModule } from './restapiModule';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IJwtPayload } from '@app/common/interface/IUser.types';
import { ValidationPipe } from '@nestjs/common';
import { logger } from '@app/common/logger/logger.middleware';
import { RedisIoAdapter } from '@app/common/adaptor/redis-socket.adaptor';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IJwtPayload {}
  }
}

async function bootstrap() {
  const app = await NestFactory.create(RestapiModule);

  /**
   * http only cookie 사용위함.
   * */
  app.use(cookieParser());

  //CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders:
      'Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
  });

  //Global Prefix
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  //Swagger
  const config = new DocumentBuilder()
    .setTitle('42PingPong API')
    .setDescription('42PingPong API description')
    .setVersion('1.0')
    .addTag('42PingPong')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.NEST_PORT);
}
bootstrap();

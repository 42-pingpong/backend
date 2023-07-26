import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IJwtPayload } from './interface/IUser.types';
import { ValidationPipe } from '@nestjs/common';
import { logger } from './logger/logger.middleware';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AuthInfo extends IJwtPayload {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IJwtPayload {}
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisClient = createClient({
    url: 'redis://redis:6379',
  });
  await redisClient.connect();

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'session:',
  });

  app.use(
    session({
      store: redisStore,
      resave: false,
      saveUninitialized: true,
      secret: 'tttt',
      cookie: {
        httpOnly: true,
        secure: false,
      },
    }),
  );

  app.use(logger);

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

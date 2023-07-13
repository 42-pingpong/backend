import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: `http://localhost:${process.env.REACT_PORT}`,
  });
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.setGlobalPrefix('api');
  await app.listen(process.env.NEST_PORT);
}
bootstrap();

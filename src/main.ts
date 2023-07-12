import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: `http://localhost:${process.env.REACT_PORT}`,
  });
  await app.listen(process.env.NEST_PORT);
}
bootstrap();

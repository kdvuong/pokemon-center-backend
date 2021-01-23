import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  await app.listen(process.env.PORT);
}
bootstrap();

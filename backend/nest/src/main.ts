import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { allowedOrigins } from './config/cors-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
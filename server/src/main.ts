import * as dotenv from 'dotenv';

dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3002, () => {
    console.log(
      'server started at: localhost:' + String(process.env.PORT ?? 3002),
    );
  });
}
bootstrap().catch(console.log);

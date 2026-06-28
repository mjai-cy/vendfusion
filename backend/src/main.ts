import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS since the website & admin dashboard run on different localhost ports
  // Enable CORS only for the frontend URL
app.enableCors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});
  
  await app.listen(3002);
  console.log(`XYZ.AI Revenue Backend Service is running on: ${await app.getUrl()}`);
}
bootstrap();

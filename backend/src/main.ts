import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });

  // Enable CORS for frontend and admin dashboard
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://localhost:3001', 'https://website-vert-nu-80.vercel.app', 'https://admin-dashbord-sepia-gamma.vercel.app'],
    credentials: true,
  });

  const port = process.env.PORT || (process.env.RAILWAY_ENVIRONMENT ? undefined : 3002);
  await app.listen(port ?? 3002);
  console.log(`xyz.ai Backend Service is running on: ${await app.getUrl()}`);
}
bootstrap();

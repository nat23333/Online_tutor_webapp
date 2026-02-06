import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(cookieParser());

  // CORS Configuration
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://*.vercel.app'
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001;

  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();

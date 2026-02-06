import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://*.vercel.app'
    ],
    credentials: true,
  });
  // await app.listen(process.env.PORT ?? 3001);
  // Vercel provides PORT automatically
  const port = process.env.PORT || 3001;

  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
// bootstrap();
// Export for Vercel serverless
export default bootstrap().then(app => app.getHttpAdapter().getInstance());
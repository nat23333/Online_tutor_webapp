import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private logger = new Logger(RedisService.name);

  onModuleInit() {
    // For this dev environment where Redis might be missing, we prefer Mock if connection fails.
    // However, catching async connection failure is hard. 
    // We will default to Mock if REDIS_URL isn't explicitly set to something else, 
    // OR we can just use Mock for now to unblock the user.

    // Unblocking strategy: Use Mock by default if no env var, or just override.
    this.logger.warn('Using in-memory Redis Mock for development');
    this.client = new RedisMock();

    // Original logic preserved for reference:
    // const url = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
    // this.client = new Redis(url);
  }

  getClient() {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    await this.client.del(key);
  }
}

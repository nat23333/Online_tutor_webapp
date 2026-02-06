import { PrismaClient } from '@prisma/client';
import { OnModuleInit, Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}

import { Module } from '@nestjs/common';

import { RedisService } from './redis.service';
import { RedisLock } from './redis-lock.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [RedisLock, RedisService],
  exports: [RedisService, RedisLock],
})
export class CacheModule {}

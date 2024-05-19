import { Injectable, Inject } from '@nestjs/common';
import {
  type RedisClientType,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from 'redis';

import { REDIS_INSTANCE } from '../redis/redis.module';

@Injectable()
export class RedisService {
  client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

  constructor(
    @Inject(REDIS_INSTANCE)
    client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>,
  ) {
    this.client = client;
  }
}

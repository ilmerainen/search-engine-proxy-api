import { Module } from '@nestjs/common';
import { createClient } from 'redis';

export const REDIS_INSTANCE = Symbol('REDIS_INSTANCE');

@Module({
  providers: [
    {
      provide: REDIS_INSTANCE,
      useFactory: async () => {
        const client = await createClient()
          .on('error', (err) => {
            console.error('Redis connection error', err);
          })
          .connect();
        return client;
      },
    },
  ],
  exports: [REDIS_INSTANCE],
})
export class RedisModule {}

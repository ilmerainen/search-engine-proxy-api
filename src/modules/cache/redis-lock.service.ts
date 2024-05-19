import { Injectable } from '@nestjs/common';

import { RedisService } from './redis.service';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

@Injectable()
export class RedisLock {
  private readonly DEFAULT_TIMEOUT = 5000;
  private readonly DEFAULT_RETRY_DELAY = 50;

  constructor(private readonly redisService: RedisService) {}

  lock(retryDelay = this.DEFAULT_RETRY_DELAY) {
    const client = this.redisService.client;
    const acquireLock = this.acquireLock.bind(this);
    const defaultTimeout = this.DEFAULT_TIMEOUT;

    async function lock<Return>(
      lockName: string,
      cb: () => Promise<Return>,
      timeout = defaultTimeout,
    ): Promise<Return> {
      if (!lockName) {
        throw new Error(
          'You must specify a lock string. It is on the redis key `lock.[string]` that the lock is acquired.',
        );
      }

      return new Promise<Return>((resolve, reject) => {
        // eslint-disable-next-line no-param-reassign
        lockName = `lock.${lockName}`;
        acquireLock(lockName, timeout, retryDelay, async () => {
          try {
            const result = await cb();
            resolve(result);
          } catch (err) {
            reject(err);
          } finally {
            await client.del(lockName);
          }
        })
          .catch((err: unknown) => reject(err))
          .finally(() => client.del(lockName));
      });
    }

    return lock;
  }

  private async acquireLock(
    lockName: string,
    timeout: number,
    retryDelay: number,
    onLockAcquired: () => Promise<void>,
  ) {
    if (timeout < 0) {
      throw new Error('Timeout cannot be negative');
    }

    const startTime = Date.now();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > timeout) {
        throw new Error('Failed to acquire lock within the specified timeout');
      }

      const result = await this.redisService.client.set(lockName, '1', {
        PX: timeout,
        NX: true,
      });

      if (result) {
        await onLockAcquired();
        return;
      }

      await sleep(retryDelay);
    }
  }
}

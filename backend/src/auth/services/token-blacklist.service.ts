import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class TokenBlacklistService {
  private readonly PREFIX = 'bl:';

  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  async blacklist(jti: string, expiresInSeconds: number): Promise<void> {
    await this.redis.set(this.PREFIX + jti, '1', 'EX', expiresInSeconds);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redis.get(this.PREFIX + jti);
    return result !== null;
  }
}

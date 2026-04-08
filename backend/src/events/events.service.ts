import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

export interface AppEvent {
  type: string;
  projectId: string;
  data: Record<string, unknown>;
}

@Injectable()
export class EventsService {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  async publish(event: AppEvent): Promise<void> {
    await this.redis.publish('app_events', JSON.stringify(event));
  }
}

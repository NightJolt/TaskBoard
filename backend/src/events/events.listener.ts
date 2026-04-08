import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AppEvent } from './events.service';
import { MemberListener } from './listeners/member.listener';

@Injectable()
export class EventsListener implements OnModuleInit {
  private readonly logger = new Logger(EventsListener.name);
  private subscriber: Redis;

  private handlers: Record<string, (event: AppEvent) => Promise<void>> = {
    'member.removed': (e) => this.memberListener.handleMemberRemoved(e),
  };

  constructor(
    private configService: ConfigService,
    private memberListener: MemberListener,
  ) {
    this.subscriber = new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
    });
  }

  onModuleInit() {
    this.subscriber.subscribe('app_events');
    this.subscriber.on('message', (_channel: string, message: string) => {
      const event: AppEvent = JSON.parse(message);
      const handler = this.handlers[event.type];
      if (handler) handler(event);
    });
    this.logger.log('Events listener started');
  }
}

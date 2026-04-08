import { Global, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';

@Global()
@Module({
  providers: [EventsService, EventsGateway],
  exports: [EventsService],
})
export class EventsModule {}

import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { EventsListener } from './events.listener';
import { MemberListener } from './listeners/member.listener';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    JwtModule,
  ],
  providers: [EventsService, EventsGateway, EventsListener, MemberListener],
  exports: [EventsService],
})
export class EventsModule {}

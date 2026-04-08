import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AppEvent } from './events.service';

@WebSocketGateway({ cors: { origin: true } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);
  private subscriber: Redis;

  @WebSocketServer()
  server: Server;

  constructor(private configService: ConfigService) {
    this.subscriber = new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
    });
  }

  afterInit() {
    this.subscriber.subscribe('app_events');

    this.subscriber.on('message', (_channel: string, message: string) => {
      const event: AppEvent = JSON.parse(message);
      this.server.to(`project:${event.projectId}`).emit(event.type, event.data);
    });

    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() projectId: string,
  ) {
    client.join(`project:${projectId}`);
    this.logger.debug(`Client ${client.id} joined project:${projectId}`);
  }

  @SubscribeMessage('leaveProject')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() projectId: string,
  ) {
    client.leave(`project:${projectId}`);
    this.logger.debug(`Client ${client.id} left project:${projectId}`);
  }
}

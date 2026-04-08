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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppEvent } from './events.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: { origin: true } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);
  private subscriber: Redis;
  private userSockets = new Map<string, Set<string>>();
  private socketUser = new Map<string, string>();

  @WebSocketServer()
  server: Server;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.subscriber = new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
    });
  }

  afterInit() {
    this.subscriber.subscribe('app_events');

    const preEmitHandlers: Record<string, (event: AppEvent, room: string) => void> = {
      'member.removed': (e, room) => this.evictUserFromRoom(e.data['userId'] as string, room),
    };

    this.subscriber.on('message', (_channel: string, message: string) => {
      const event: AppEvent = JSON.parse(message);
      const room = `project:${event.projectId}`;

      preEmitHandlers[event.type]?.(event, room);
      this.server.to(room).emit(event.type, event.data);
    });

    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.['token'] as string | undefined;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      const userId = payload.sub;

      this.socketUser.set(client.id, userId);
      const sockets = this.userSockets.get(userId) ?? new Set<string>();
      sockets.add(client.id);
      this.userSockets.set(userId, sockets);

      this.logger.debug(`Client ${client.id} connected (user:${userId})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUser.get(client.id);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.userSockets.delete(userId);
      }
      this.socketUser.delete(client.id);
    }
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

  private evictUserFromRoom(userId: string, room: string) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds) return;

    for (const socketId of socketIds) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(room);
        this.logger.debug(`Evicted socket ${socketId} (user:${userId}) from ${room}`);
      }
    }
  }
}

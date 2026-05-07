import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private userSocketMap = new Map<string, Set<string>>();

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      client.data.userId = payload.sub;

      if (!this.userSocketMap.has(payload.sub)) {
        this.userSocketMap.set(payload.sub, new Set());
      }
      this.userSocketMap.get(payload.sub).add(client.id);

      client.join(`user:${payload.sub}`);
      this.logger.log(`User ${payload.sub} connected (socket: ${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSocketMap.get(userId)?.delete(client.id);
      if (this.userSocketMap.get(userId)?.size === 0) {
        this.userSocketMap.delete(userId);
      }
    }
    this.logger.log(`Socket ${client.id} disconnected`);
  }

  notifyUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }
}

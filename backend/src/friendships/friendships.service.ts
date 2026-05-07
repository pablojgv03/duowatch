import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../gateway/events.gateway';

@Injectable()
export class FriendshipsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private gateway: EventsGateway,
  ) {}

  async sendRequest(requesterId: string, receiverId: string) {
    if (requesterId === receiverId)
      throw new BadRequestException('Cannot send friend request to yourself');

    const existing = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'PENDING') throw new ConflictException('Friend request already pending');
      if (existing.status === 'ACCEPTED') throw new ConflictException('Already friends');
    }

    const alreadyFriends = await this.areFriends(requesterId, receiverId);
    if (alreadyFriends) throw new ConflictException('Already friends');

    const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) throw new NotFoundException('User not found');

    const request = await this.prisma.friendRequest.upsert({
      where: { requesterId_receiverId: { requesterId, receiverId } },
      create: { requesterId, receiverId, status: 'PENDING' },
      update: { status: 'PENDING' },
    });

    const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });

    await this.notifications.create({
      userId: receiverId,
      type: 'FRIEND_REQUEST',
      title: 'Nueva solicitud de amistad',
      message: `${requester.displayName || requester.username} quiere ser tu amigo`,
      data: { requestId: request.id, userId: requesterId },
    });

    this.gateway.notifyUser(receiverId, 'friend_request', { request, requester });

    return request;
  }

  async acceptRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Friend request not found');
    if (request.receiverId !== userId) throw new BadRequestException('Not authorized');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is not pending');

    const [_, friendship] = await this.prisma.$transaction([
      this.prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
      this.prisma.friendship.create({
        data: {
          userAId: request.requesterId,
          userBId: request.receiverId,
        },
      }),
    ]);

    const accepter = await this.prisma.user.findUnique({ where: { id: userId } });

    await this.notifications.create({
      userId: request.requesterId,
      type: 'FRIEND_ACCEPTED',
      title: '¡Nueva amistad!',
      message: `${accepter.displayName || accepter.username} ha aceptado tu solicitud`,
      data: { userId },
    });

    this.gateway.notifyUser(request.requesterId, 'friend_accepted', { friendship });

    return friendship;
  }

  async rejectRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Friend request not found');
    if (request.receiverId !== userId) throw new BadRequestException('Not authorized');

    await this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    return { success: true };
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } },
        userB: { select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } },
      },
    });

    return friendships.map((f) => ({
      friendshipId: f.id,
      since: f.createdAt,
      friend: f.userAId === userId ? f.userB : f.userA,
    }));
  }

  async getPendingRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        requester: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSentRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: { requesterId: userId, status: 'PENDING' },
      include: {
        receiver: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeFriend(friendshipId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw new NotFoundException('Friendship not found');
    if (friendship.userAId !== userId && friendship.userBId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    await this.prisma.friendship.delete({ where: { id: friendshipId } });
    return { success: true };
  }

  async areFriends(userAId: string, userBId: string): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });
    return !!friendship;
  }
}

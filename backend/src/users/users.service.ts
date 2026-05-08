import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        _count: {
          select: {
            friendshipsA: true,
            friendshipsB: true,
            interactions: { where: { action: 'LIKED' } },
            matchesA: true,
            matchesB: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, refreshToken, ...safeUser } = user;
    return {
      ...safeUser,
      stats: {
        friends: user._count.friendshipsA + user._count.friendshipsB,
        liked: user._count.interactions,
        matches: user._count.matchesA + user._count.matchesB,
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            friendshipsA: true,
            friendshipsB: true,
            matchesA: true,
            matchesB: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, refreshToken, ...safeUser } = user;
    return {
      ...safeUser,
      stats: {
        friends: user._count.friendshipsA + user._count.friendshipsB,
        matches: user._count.matchesA + user._count.matchesB,
      },
    };
  }

  async search(query: string, currentUserId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
      take: 20,
    });

    return users;
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    const { passwordHash, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  async completeOnboarding(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboarded: true },
    });
    const { passwordHash, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { emailNotifications: dto.emailNotifications },
    });
    const { passwordHash, refreshToken, ...safeUser } = user;
    return safeUser;
  }
}

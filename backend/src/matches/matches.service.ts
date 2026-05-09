import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../gateway/events.gateway';
import { EmailService } from '../email/email.service';
import { MediaType } from '@prisma/client';

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private gateway: EventsGateway,
    private emailService: EmailService,
  ) {}

  async checkAndCreateMatches(
    userId: string,
    tmdbId: number,
    mediaType: MediaType,
    title: string,
    posterPath?: string,
  ) {
    const friendships = await this.prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
    });

    const friendIds = friendships.map((f) =>
      f.userAId === userId ? f.userBId : f.userAId,
    );

    for (const friendId of friendIds) {
      const friendLiked = await this.prisma.movieInteraction.findFirst({
        where: { userId: friendId, tmdbId, mediaType, action: 'LIKED' },
      });

      if (friendLiked) {
        await this.createMatch(userId, friendId, tmdbId, mediaType, title, posterPath);
      }
    }
  }

  async createMatch(
    userAId: string,
    userBId: string,
    tmdbId: number,
    mediaType: MediaType,
    title: string,
    posterPath?: string,
  ) {
    const [idA, idB] = [userAId, userBId].sort();

    const existing = await this.prisma.match.findUnique({
      where: { userAId_userBId_tmdbId_mediaType: { userAId: idA, userBId: idB, tmdbId, mediaType } },
    });

    if (existing) return existing;

    const score = await this.computeCompatibilityScore(idA, idB);

    const match = await this.prisma.match.create({
      data: {
        userAId: idA,
        userBId: idB,
        tmdbId,
        mediaType,
        title,
        posterPath,
        score,
      },
    });

    const [userAInfo, userBInfo] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userAId },
        select: { id: true, username: true, displayName: true, avatarUrl: true, email: true, emailNotifications: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userBId },
        select: { id: true, username: true, displayName: true, avatarUrl: true, email: true, emailNotifications: true },
      }),
    ]);

    await Promise.all([
      this.notifications.create({
        userId: userAId,
        type: 'MATCH',
        title: '¡Nuevo Match! 🎬',
        message: `Tú y tu amigo/a coincidís en "${title}"`,
        data: { matchId: match.id, tmdbId, mediaType, title, posterPath },
      }),
      this.notifications.create({
        userId: userBId,
        type: 'MATCH',
        title: '¡Nuevo Match! 🎬',
        message: `Tú y tu amigo/a coincidís en "${title}"`,
        data: { matchId: match.id, tmdbId, mediaType, title, posterPath },
      }),
    ]);

    this.gateway.notifyUser(userAId, 'new_match', { match, friend: userBInfo });
    this.gateway.notifyUser(userBId, 'new_match', { match, friend: userAInfo });

    // Send email notifications if user has them enabled
    if (userAInfo?.emailNotifications) {
      const friendName = userBInfo?.displayName || userBInfo?.username || 'tu amigo/a';
      this.emailService.sendMatchNotificationEmail(
        userAInfo.email,
        friendName,
        title,
        posterPath ?? null,
      ).catch(() => {});
    }

    if (userBInfo?.emailNotifications) {
      const friendName = userAInfo?.displayName || userAInfo?.username || 'tu amigo/a';
      this.emailService.sendMatchNotificationEmail(
        userBInfo.email,
        friendName,
        title,
        posterPath ?? null,
      ).catch(() => {});
    }

    return match;
  }

  async getMyMatches(userId: string) {
    return this.prisma.match.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      include: {
        userA: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        userB: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMatchesWithFriend(userId: string, friendId: string) {
    const [idA, idB] = [userId, friendId].sort();

    return this.prisma.match.findMany({
      where: { userAId: idA, userBId: idB },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMatchStats(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
    });

    const byType = {
      movie: matches.filter((m) => m.mediaType === 'MOVIE').length,
      tv: matches.filter((m) => m.mediaType === 'TV').length,
    };

    const friends = await this.prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
    });

    const matchesPerFriend = await Promise.all(
      friends.map(async (f) => {
        const friendId = f.userAId === userId ? f.userBId : f.userAId;
        const count = await this.getMatchesWithFriend(userId, friendId);
        return { friendId, count: count.length };
      }),
    );

    const topFriend = matchesPerFriend.sort((a, b) => b.count - a.count)[0];

    return {
      total: matches.length,
      byType,
      topFriendId: topFriend?.friendId,
      averageScore: matches.length
        ? matches.reduce((sum, m) => sum + m.score, 0) / matches.length
        : 0,
    };
  }

  private async computeCompatibilityScore(userAId: string, userBId: string): Promise<number> {
    const [prefsA, prefsB] = await Promise.all([
      this.prisma.userPreferences.findUnique({ where: { userId: userAId } }),
      this.prisma.userPreferences.findUnique({ where: { userId: userBId } }),
    ]);

    if (!prefsA || !prefsB) return 50;

    const genresA = new Set(prefsA.favoriteGenres);
    const genresB = new Set(prefsB.favoriteGenres);

    const intersection = [...genresA].filter((g) => genresB.has(g)).length;
    const union = new Set([...genresA, ...genresB]).size;

    const jaccardSimilarity = union > 0 ? (intersection / union) * 100 : 50;

    const [likedA, likedB] = await Promise.all([
      this.prisma.movieInteraction.findMany({ where: { userId: userAId, action: 'LIKED' } }),
      this.prisma.movieInteraction.findMany({ where: { userId: userBId, action: 'LIKED' } }),
    ]);

    const likedSetA = new Set(likedA.map((l) => `${l.tmdbId}-${l.mediaType}`));
    const likedSetB = new Set(likedB.map((l) => `${l.tmdbId}-${l.mediaType}`));

    const likedIntersection = [...likedSetA].filter((m) => likedSetB.has(m)).length;
    const likedUnion = new Set([...likedSetA, ...likedSetB]).size;
    const likeSimilarity = likedUnion > 0 ? (likedIntersection / likedUnion) * 100 : 50;

    return Math.round(jaccardSimilarity * 0.6 + likeSimilarity * 0.4);
  }
}

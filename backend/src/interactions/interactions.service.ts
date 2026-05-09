import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInteractionDto } from './dto/interaction.dto';
import { MatchesService } from '../matches/matches.service';
import { InteractionType, MediaType } from '@prisma/client';

@Injectable()
export class InteractionsService {
  constructor(
    private prisma: PrismaService,
    private matchesService: MatchesService,
  ) {}

  async upsert(userId: string, dto: CreateInteractionDto) {
    // LIKED y DISLIKED son mutuamente exclusivos: eliminar el opuesto si existe
    if (dto.action === InteractionType.LIKED || dto.action === InteractionType.DISLIKED) {
      const opposite = dto.action === InteractionType.LIKED ? InteractionType.DISLIKED : InteractionType.LIKED;
      await this.prisma.movieInteraction.deleteMany({
        where: { userId, tmdbId: dto.tmdbId, mediaType: dto.mediaType, action: opposite },
      });
    }

    const interaction = await this.prisma.movieInteraction.upsert({
      where: {
        userId_tmdbId_mediaType_action: {
          userId,
          tmdbId: dto.tmdbId,
          mediaType: dto.mediaType,
          action: dto.action,
        },
      },
      create: {
        userId,
        tmdbId: dto.tmdbId,
        mediaType: dto.mediaType,
        action: dto.action,
        rating: dto.rating,
        title: dto.title,
        posterPath: dto.posterPath,
      },
      update: {
        rating: dto.rating,
      },
    });

    if (dto.action === InteractionType.LIKED) {
      await this.matchesService.checkAndCreateMatches(userId, dto.tmdbId, dto.mediaType, dto.title, dto.posterPath);
    }

    return interaction;
  }

  async getMyInteractions(userId: string) {
    return this.prisma.movieInteraction.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getByAction(userId: string, action: InteractionType) {
    return this.prisma.movieInteraction.findMany({
      where: { userId, action },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getByMediaType(userId: string, mediaType: MediaType) {
    return this.prisma.movieInteraction.findMany({
      where: { userId, mediaType },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getUserInteractionForMedia(userId: string, tmdbId: number, mediaType: MediaType) {
    return this.prisma.movieInteraction.findMany({
      where: { userId, tmdbId, mediaType },
    });
  }
}

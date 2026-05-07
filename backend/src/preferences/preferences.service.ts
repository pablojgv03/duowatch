import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePreferencesDto } from './dto/preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(private prisma: PrismaService) {}

  async getMyPreferences(userId: string) {
    const prefs = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    return prefs || {
      userId,
      favoriteGenres: [],
      preferredTypes: ['movie', 'tv'],
      minRating: 5.0,
      languages: ['en', 'es'],
    };
  }

  async upsert(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        favoriteGenres: dto.favoriteGenres || [],
        preferredTypes: dto.preferredTypes || ['movie', 'tv'],
        minRating: dto.minRating || 5.0,
        languages: dto.languages || ['en', 'es'],
      },
      update: {
        ...dto,
      },
    });
  }
}

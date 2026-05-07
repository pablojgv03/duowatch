import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FriendshipsModule } from './friendships/friendships.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { InteractionsModule } from './interactions/interactions.module';
import { MatchesModule } from './matches/matches.module';
import { PreferencesModule } from './preferences/preferences.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    FriendshipsModule,
    TmdbModule,
    InteractionsModule,
    MatchesModule,
    PreferencesModule,
    RecommendationsModule,
    NotificationsModule,
    GatewayModule,
  ],
})
export class AppModule {}

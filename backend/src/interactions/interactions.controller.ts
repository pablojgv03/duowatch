import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/interaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InteractionType, MediaType } from '@prisma/client';

@ApiTags('interactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interactions')
export class InteractionsController {
  constructor(private service: InteractionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update a movie interaction (like/dislike/watch)' })
  upsert(@CurrentUser('id') userId: string, @Body() dto: CreateInteractionDto) {
    return this.service.upsert(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all my interactions' })
  getMyInteractions(@CurrentUser('id') userId: string) {
    return this.service.getMyInteractions(userId);
  }

  @Get('me/liked')
  @ApiOperation({ summary: 'Get my liked movies/shows' })
  getLiked(@CurrentUser('id') userId: string) {
    return this.service.getByAction(userId, InteractionType.LIKED);
  }

  @Get('me/watched')
  @ApiOperation({ summary: 'Get my watched movies/shows' })
  getWatched(@CurrentUser('id') userId: string) {
    return this.service.getByAction(userId, InteractionType.WATCHED);
  }

  @Get('me/watchlist')
  @ApiOperation({ summary: 'Get my watchlist' })
  getWatchlist(@CurrentUser('id') userId: string) {
    return this.service.getByAction(userId, InteractionType.WANT_TO_WATCH);
  }
}

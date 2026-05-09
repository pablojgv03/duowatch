import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private service: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get personalized recommendations for current user' })
  getPersonalized(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('type') type?: 'movie' | 'tv',
    @Query('exclude') exclude?: string,
  ) {
    return this.service.getPersonalized(userId, Number(page), type, exclude === 'all');
  }

  @Get('duo/:friendId')
  @ApiOperation({ summary: 'Get recommendations for a duo (current user + friend)' })
  getForDuo(@CurrentUser('id') userId: string, @Param('friendId') friendId: string) {
    return this.service.getForDuo(userId, friendId);
  }
}

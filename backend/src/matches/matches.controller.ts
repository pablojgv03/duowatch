import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private service: MatchesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get all my matches' })
  getMyMatches(@CurrentUser('id') userId: string) {
    return this.service.getMyMatches(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get match statistics' })
  getStats(@CurrentUser('id') userId: string) {
    return this.service.getMatchStats(userId);
  }

  @Get('with/:friendId')
  @ApiOperation({ summary: 'Get matches with a specific friend' })
  getMatchesWithFriend(
    @CurrentUser('id') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.service.getMatchesWithFriend(userId, friendId);
  }
}

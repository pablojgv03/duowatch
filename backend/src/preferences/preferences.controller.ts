import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from './dto/preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('preferences')
export class PreferencesController {
  constructor(private service: PreferencesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my preferences' })
  getMyPreferences(@CurrentUser('id') userId: string) {
    return this.service.getMyPreferences(userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Create or update my preferences' })
  upsert(@CurrentUser('id') userId: string, @Body() dto: UpdatePreferencesDto) {
    return this.service.upsert(userId, dto);
  }
}

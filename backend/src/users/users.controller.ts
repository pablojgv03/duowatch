import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  @Post('me/complete-onboarding')
  @ApiOperation({ summary: 'Mark user as onboarded' })
  completeOnboarding(@CurrentUser('id') userId: string) {
    return this.usersService.completeOnboarding(userId);
  }

  @Patch('me/notifications')
  @ApiOperation({ summary: 'Update email notification preferences' })
  updateNotifications(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNotificationsDto,
  ) {
    return this.usersService.updateNotifications(userId, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by username or display name' })
  search(@Query('q') query: string, @CurrentUser('id') userId: string) {
    return this.usersService.search(query || '', userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public user profile by ID' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FriendshipsService } from './friendships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('friendships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friendships')
export class FriendshipsController {
  constructor(private service: FriendshipsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all friends' })
  getFriends(@CurrentUser('id') userId: string) {
    return this.service.getFriends(userId);
  }

  @Get('requests/received')
  @ApiOperation({ summary: 'Get received pending friend requests' })
  getReceivedRequests(@CurrentUser('id') userId: string) {
    return this.service.getPendingRequests(userId);
  }

  @Get('requests/sent')
  @ApiOperation({ summary: 'Get sent pending friend requests' })
  getSentRequests(@CurrentUser('id') userId: string) {
    return this.service.getSentRequests(userId);
  }

  @Post('request/:userId')
  @ApiOperation({ summary: 'Send a friend request' })
  sendRequest(@CurrentUser('id') requesterId: string, @Param('userId') receiverId: string) {
    return this.service.sendRequest(requesterId, receiverId);
  }

  @Patch('request/:requestId/accept')
  @ApiOperation({ summary: 'Accept a friend request' })
  acceptRequest(@Param('requestId') requestId: string, @CurrentUser('id') userId: string) {
    return this.service.acceptRequest(requestId, userId);
  }

  @Patch('request/:requestId/reject')
  @ApiOperation({ summary: 'Reject a friend request' })
  rejectRequest(@Param('requestId') requestId: string, @CurrentUser('id') userId: string) {
    return this.service.rejectRequest(requestId, userId);
  }

  @Delete(':friendshipId')
  @ApiOperation({ summary: 'Remove a friend' })
  removeFriend(@Param('friendshipId') friendshipId: string, @CurrentUser('id') userId: string) {
    return this.service.removeFriend(friendshipId, userId);
  }
}

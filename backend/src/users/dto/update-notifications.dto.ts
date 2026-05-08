import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationsDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  emailNotifications: boolean;
}

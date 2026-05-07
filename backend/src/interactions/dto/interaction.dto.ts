import { IsInt, IsEnum, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaType, InteractionType } from '@prisma/client';

export class CreateInteractionDto {
  @ApiProperty()
  @IsInt()
  tmdbId: number;

  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiProperty({ enum: InteractionType })
  @IsEnum(InteractionType)
  action: InteractionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  posterPath?: string;
}

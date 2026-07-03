import {
  IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum,
  IsBoolean, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ChallengeType } from '../entities/challenge.entity';

export class CreateBadgeDto {
  @ApiProperty({ example: 'Premier pas' }) @IsString() @IsNotEmpty() label: string;
  @ApiProperty({ example: '🏅' }) @IsString() @IsNotEmpty() icon: string;
  @ApiProperty({ example: 'Complétez votre première séance' }) @IsString() description: string;
  @ApiPropertyOptional({ example: 100 }) @IsOptional() @IsNumber() @Type(() => Number) @Min(0) pointsRequired?: number;
  @ApiPropertyOptional({ example: 'sessions' }) @IsOptional() @IsString() triggerType?: string;
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @IsNumber() @Type(() => Number) triggerValue?: number;
}

export class CreateChallengeDto {
  @ApiProperty({ example: 'Séance du matin' }) @IsString() @IsNotEmpty() title: string;
  @ApiProperty({ example: 'Effectuez une séance avant 10h' }) @IsString() description: string;
  @ApiProperty({ example: 50 }) @IsNumber() @Type(() => Number) @Min(0) points: number;
  @ApiProperty({ example: '🌅' }) @IsString() @IsNotEmpty() icon: string;
  @ApiProperty({ enum: ChallengeType }) @IsEnum(ChallengeType) type: ChallengeType;
}

export class CompleteChallengeDto {
  @ApiProperty() @IsString() @IsNotEmpty() challengeId: string;
  @ApiProperty({ example: '2024-03-18' }) @IsString() challengeDate: string;
}
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType }) @IsEnum(NotificationType) type: NotificationType;
  @ApiProperty({ example: 'Séance complétée ! 🎉' }) @IsString() @IsNotEmpty() title: string;
  @ApiProperty({ example: 'Bravo, vous avez brûlé 450 kcal aujourd\'hui !' }) @IsString() message: string;
  @ApiPropertyOptional({ example: '🏋️' }) @IsOptional() @IsString() icon?: string;
  @ApiProperty({ description: 'ID de l\'utilisateur destinataire' }) @IsString() userId: string;
}
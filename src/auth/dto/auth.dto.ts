import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FitnessLevel } from '../../users/entities/user.entity';

export class LoginDto {
  @ApiProperty({ example: 'user@fittrack.com', description: 'Adresse email' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({ example: 'motdepasse123', description: 'Mot de passe (min 6 caractères)' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Jean Dupont', description: 'Nom complet' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères' })
  name: string;

  @ApiProperty({ example: 'jean.dupont@email.com', description: 'Adresse email' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({ example: 'motdepasse123', description: 'Mot de passe (min 6 caractères)' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(128, { message: 'Le mot de passe est trop long' })
  password: string;

  @ApiPropertyOptional({ example: 'Prise de masse', description: 'Objectif fitness' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({
    enum: FitnessLevel,
    example: FitnessLevel.BEGINNER,
    description: 'Niveau de fitness',
  })
  @IsOptional()
  @IsEnum(FitnessLevel, { message: 'Niveau invalide' })
  level?: FitnessLevel;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@fittrack.com' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de réinitialisation' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'nouveaumotdepasse123', description: 'Nouveau mot de passe' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mot de passe actuel' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'Nouveau mot de passe (min 6 caractères)' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

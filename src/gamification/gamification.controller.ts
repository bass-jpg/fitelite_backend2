import {
  Controller, Get, Post, Body, Param, UseGuards, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { CreateBadgeDto, CreateChallengeDto, CompleteChallengeDto } from './dto/gamification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Gamification')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  // ──── BADGES ────

  @Public()
  @Get('badges')
  @ApiOperation({ summary: 'Liste de tous les badges disponibles (public)' })
  findAllBadges() {
    return this.gamificationService.findAllBadges();
  }

  @Get('badges/me')
  @ApiOperation({ summary: 'Mes badges débloqués' })
  getUserBadges(@CurrentUser() user: User) {
    return this.gamificationService.getUserBadges(user.id);
  }

  @Post('badges')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Créer un badge' })
  createBadge(@Body() dto: CreateBadgeDto) {
    return this.gamificationService.createBadge(dto);
  }

  @Post('badges/award/:userId/:badgeId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Attribuer manuellement un badge à un utilisateur' })
  awardBadge(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('badgeId', ParseUUIDPipe) badgeId: string,
  ) {
    return this.gamificationService.awardBadge(userId, badgeId);
  }

  // ──── CHALLENGES ────

  @Public()
  @Get('challenges')
  @ApiOperation({ summary: 'Liste des défis disponibles (public)' })
  @ApiQuery({ name: 'type', required: false, enum: ['daily', 'weekly'] })
  findAllChallenges(@Query('type') type?: string) {
    return this.gamificationService.findAllChallenges(type);
  }

  @Get('challenges/me')
  @ApiOperation({ summary: 'Mes défis du jour avec statut de complétion' })
  @ApiQuery({ name: 'date', required: false, description: 'Date YYYY-MM-DD (défaut: aujourd\'hui)' })
  getUserChallenges(@CurrentUser() user: User, @Query('date') date?: string) {
    const today = date || new Date().toISOString().split('T')[0];
    return this.gamificationService.getUserChallengesForDate(user.id, today);
  }

  @Post('challenges')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Créer un défi' })
  createChallenge(@Body() dto: CreateChallengeDto) {
    return this.gamificationService.createChallenge(dto);
  }

  @Post('challenges/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer un défi comme complété et gagner des points' })
  completeChallenge(@Body() dto: CompleteChallengeDto, @CurrentUser() user: User) {
    return this.gamificationService.completeChallenge(dto, user.id);
  }

  // ──── POINTS ────

  @Get('points/me')
  @ApiOperation({ summary: 'Mes points totaux' })
  getMyPoints(@CurrentUser() user: User) {
    return this.gamificationService.getUserPoints(user.id);
  }
}
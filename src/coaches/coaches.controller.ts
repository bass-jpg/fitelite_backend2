import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Query, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto } from './dto/coach.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Coaches')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liste de tous les coaches (public)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.coachesService.findAll(+page, +limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un coach (public)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Créer un coach' })
  create(@Body() dto: CreateCoachDto) {
    return this.coachesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: '[ADMIN/COACH] Mettre à jour un coach' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCoachDto) {
    return this.coachesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Supprimer un coach' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachesService.remove(id);
  }
}

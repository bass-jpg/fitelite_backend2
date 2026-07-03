import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Query, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import {
  CreateMealDto, UpdateMealDto,
  CreateDailyMenuDto, UpdateDailyMenuDto,
} from './dto/nutrition.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';
import { MealCategory } from './entities/meal.entity';

@ApiTags('Nutrition')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  // ──── MEALS ────

  @Public()
  @Get('meals')
  @ApiOperation({ summary: 'Liste des repas disponibles (public, filtrable)' })
  @ApiQuery({ name: 'category', required: false, enum: MealCategory })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAllMeals(
    @Query('category') category?: MealCategory,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.nutritionService.findAllMeals(category, search, +page, +limit);
  }

  @Public()
  @Get('meals/:id')
  @ApiOperation({ summary: 'Détails d\'un repas (public)' })
  findOneMeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutritionService.findOneMeal(id);
  }

  @Post('meals')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: '[ADMIN/COACH] Créer un repas' })
  createMeal(@Body() dto: CreateMealDto) {
    return this.nutritionService.createMeal(dto);
  }

  @Patch('meals/:id')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: '[ADMIN/COACH] Mettre à jour un repas' })
  updateMeal(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMealDto) {
    return this.nutritionService.updateMeal(id, dto);
  }

  @Delete('meals/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Supprimer un repas' })
  removeMeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.nutritionService.removeMeal(id);
  }

  // ──── DAILY MENUS ────

  @Get('menus')
  @ApiOperation({ summary: 'Historique de mes menus quotidiens' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findMenus(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 30,
  ) {
    return this.nutritionService.findDailyMenus(user.id, +page, +limit);
  }

  @Get('menus/date/:date')
  @ApiOperation({ summary: 'Menu d\'une date précise (YYYY-MM-DD)' })
  findMenuByDate(@CurrentUser() user: User, @Param('date') date: string) {
    return this.nutritionService.findDailyMenuByDate(user.id, date);
  }

  @Post('menus')
  @ApiOperation({ summary: 'Créer un menu quotidien' })
  createMenu(@Body() dto: CreateDailyMenuDto, @CurrentUser() user: User) {
    return this.nutritionService.createDailyMenu(dto, user.id);
  }

  @Patch('menus/:id')
  @ApiOperation({ summary: 'Mettre à jour un menu quotidien' })
  updateMenu(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDailyMenuDto,
    @CurrentUser() user: User,
  ) {
    return this.nutritionService.updateDailyMenu(id, dto, user.id);
  }

  @Delete('menus/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un menu quotidien' })
  removeMenu(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.nutritionService.removeDailyMenu(id, user.id);
  }
}
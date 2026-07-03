import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal, MealCategory } from './entities/meal.entity';
import { DailyMenu } from './entities/daily-menu.entity';
import {
  CreateMealDto, UpdateMealDto,
  CreateDailyMenuDto, UpdateDailyMenuDto,
} from './dto/nutrition.dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(Meal)
    private mealsRepository: Repository<Meal>,
    @InjectRepository(DailyMenu)
    private dailyMenuRepository: Repository<DailyMenu>,
  ) {}

  // ──── MEALS ────

  async createMeal(dto: CreateMealDto): Promise<Meal> {
    const meal = this.mealsRepository.create(dto);
    return this.mealsRepository.save(meal);
  }

  async findAllMeals(category?: MealCategory, search?: string, page = 1, limit = 20) {
    const qb = this.mealsRepository.createQueryBuilder('meal')
      .where('meal.isActive = :isActive', { isActive: true })
      .orderBy('meal.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) qb.andWhere('meal.category = :category', { category });
    if (search) {
      qb.andWhere(
        '(LOWER(meal.name) LIKE :search OR LOWER(meal.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneMeal(id: string): Promise<Meal> {
    const meal = await this.mealsRepository.findOne({ where: { id, isActive: true } });
    if (!meal) throw new NotFoundException('Repas introuvable');
    return meal;
  }

  async updateMeal(id: string, dto: UpdateMealDto): Promise<Meal> {
    const meal = await this.findOneMeal(id);
    Object.assign(meal, dto);
    return this.mealsRepository.save(meal);
  }

  async removeMeal(id: string) {
    const meal = await this.findOneMeal(id);
    meal.isActive = false;
    await this.mealsRepository.save(meal);
    return { message: 'Repas supprimé' };
  }

  // ──── DAILY MENUS ────

  async createDailyMenu(dto: CreateDailyMenuDto, userId: string): Promise<DailyMenu> {
    // Calculate totals from linked meals
    const totals = await this.calculateTotals(dto);

    const menu = this.dailyMenuRepository.create({
      ...dto,
      userId,
      ...totals,
    });
    return this.dailyMenuRepository.save(menu);
  }

  async findDailyMenus(userId: string, page = 1, limit = 30) {
    const [data, total] = await this.dailyMenuRepository.findAndCount({
      where: { userId },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findDailyMenuByDate(userId: string, date: string): Promise<DailyMenu> {
    const menu = await this.dailyMenuRepository.findOne({ where: { userId, date } });
    if (!menu) throw new NotFoundException(`Aucun menu pour le ${date}`);
    return menu;
  }

  async updateDailyMenu(id: string, dto: UpdateDailyMenuDto, userId: string) {
    const menu = await this.dailyMenuRepository.findOne({ where: { id, userId } });
    if (!menu) throw new NotFoundException('Menu introuvable');

    Object.assign(menu, dto);
    const totals = await this.calculateTotals({ ...menu, ...dto });
    Object.assign(menu, totals);

    return this.dailyMenuRepository.save(menu);
  }

  async removeDailyMenu(id: string, userId: string) {
    const menu = await this.dailyMenuRepository.findOne({ where: { id, userId } });
    if (!menu) throw new NotFoundException('Menu introuvable');
    await this.dailyMenuRepository.remove(menu);
    return { message: 'Menu supprimé' };
  }

  private async calculateTotals(dto: Partial<CreateDailyMenuDto>) {
    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    const mealIds = [dto.breakfastId, dto.lunchId, dto.dinnerId].filter(Boolean);

    for (const mealId of mealIds) {
      const meal = await this.mealsRepository.findOne({ where: { id: mealId } });
      if (meal) {
        totalCalories += meal.calories;
        totalProteins += Number(meal.proteins);
        totalCarbs += Number(meal.carbs);
        totalFats += Number(meal.fats);
      }
    }

    return { totalCalories, totalProteins, totalCarbs, totalFats };
  }
}
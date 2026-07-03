import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { Meal } from './entities/meal.entity';
import { DailyMenu } from './entities/daily-menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meal, DailyMenu])],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
import {
  IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum,
  IsArray, IsUUID, IsDateString, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MealCategory } from '../entities/meal.entity';
import { NutritionGoal } from '../entities/daily-menu.entity';

export class CreateMealDto {
  @ApiProperty({ example: 'Thiéboudienne' })
  @IsString() @IsNotEmpty() name: string;

  @ApiProperty({ enum: MealCategory })
  @IsEnum(MealCategory) category: MealCategory;

  @ApiProperty({ example: 650 })
  @IsNumber() @Type(() => Number) @Min(0) calories: number;

  @ApiProperty({ example: 35 })
  @IsNumber() @Type(() => Number) @Min(0) proteins: number;

  @ApiProperty({ example: 80 })
  @IsNumber() @Type(() => Number) @Min(0) carbs: number;

  @ApiProperty({ example: 18 })
  @IsNumber() @Type(() => Number) @Min(0) fats: number;

  @ApiPropertyOptional() @IsOptional() @IsString() image?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional({ type: 'array' })
  @IsOptional() @IsArray() portions?: any[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class UpdateMealDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ enum: MealCategory }) @IsOptional() @IsEnum(MealCategory) category?: MealCategory;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) @Min(0) calories?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) @Min(0) proteins?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) @Min(0) carbs?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) @Min(0) fats?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() image?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class CreateDailyMenuDto {
  @ApiProperty({ example: '2024-03-18' })
  @IsDateString() date: string;

  @ApiProperty({ enum: NutritionGoal })
  @IsEnum(NutritionGoal) goal: NutritionGoal;

  @ApiPropertyOptional() @IsOptional() @IsUUID() breakfastId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() lunchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() dinnerId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) calorieTarget?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateDailyMenuDto {
  @ApiPropertyOptional({ enum: NutritionGoal }) @IsOptional() @IsEnum(NutritionGoal) goal?: NutritionGoal;
  @ApiPropertyOptional() @IsOptional() @IsUUID() breakfastId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() lunchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() dinnerId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) calorieTarget?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Meal } from './meal.entity';

export enum NutritionGoal {
  WEIGHT_LOSS = 'perte-de-poids',
  MASS_GAIN = 'prise-de-masse',
  MAINTENANCE = 'maintenance',
}

@Entity('daily_menus')
export class DailyMenu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: NutritionGoal,
    default: NutritionGoal.MAINTENANCE,
  })
  goal: NutritionGoal;

  @Column({ type: 'int', default: 0 })
  totalCalories: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  totalProteins: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  totalCarbs: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  totalFats: number;

  @Column({ nullable: true, type: 'int' })
  calorieTarget: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Meal, { nullable: true, eager: true })
  @JoinColumn({ name: 'breakfastId' })
  breakfast: Meal;

  @Column({ nullable: true })
  breakfastId: string;

  @ManyToOne(() => Meal, { nullable: true, eager: true })
  @JoinColumn({ name: 'lunchId' })
  lunch: Meal;

  @Column({ nullable: true })
  lunchId: string;

  @ManyToOne(() => Meal, { nullable: true, eager: true })
  @JoinColumn({ name: 'dinnerId' })
  dinner: Meal;

  @Column({ nullable: true })
  dinnerId: string;
}
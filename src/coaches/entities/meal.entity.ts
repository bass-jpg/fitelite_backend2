import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MealCategory {
  BREAKFAST = 'petit-dejeuner',
  LUNCH = 'dejeuner',
  DINNER = 'diner',
  SNACK = 'collation',
}

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({
    type: 'enum',
    enum: MealCategory,
    default: MealCategory.LUNCH,
  })
  category: MealCategory;

  @Column({ type: 'int', default: 0 })
  calories: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  proteins: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  carbs: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 0 })
  fats: number;

  @Column({ nullable: true, type: 'text' })
  image: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  // Stored as JSON
  @Column({ type: 'json', nullable: true })
  portions: {
    size: 'petite' | 'normale' | 'grande';
    label: string;
    multiplier: number;
  }[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserBadge } from './user-badge.entity';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  label: string;

  @Column({ length: 10 })
  icon: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 0 })
  pointsRequired: number;

  @Column({ nullable: true, length: 50 })
  triggerType: string; // 'sessions', 'streak', 'calories', 'challenges'

  @Column({ nullable: true, type: 'int' })
  triggerValue: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @OneToMany(() => UserBadge, (userBadge) => userBadge.badge)
  userBadges: UserBadge[];
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Badge } from './badge.entity';

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  earnedDate: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.userBadges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Badge, (badge) => badge.userBadges, { eager: true })
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;

  @Column()
  badgeId: string;
}
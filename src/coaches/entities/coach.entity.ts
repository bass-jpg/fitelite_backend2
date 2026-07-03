import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Program } from '../../programs/entities/program.entity';

@Entity('coaches')
export class Coach {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  specialty: string;

  @Column({ length: 50 })
  experience: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5.0 })
  rating: number;

  @Column({ default: 0 })
  clients: number;

  @Column({ nullable: true, type: 'text' })
  image: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[];

  // Location fields (stored as JSON column)
  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  locationLat: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  locationLng: number;

  @Column({ nullable: true, length: 255 })
  locationAddress: string;

  @Column({ nullable: true, length: 100 })
  email: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Program, (program) => program.coach)
  programs: Program[];
}

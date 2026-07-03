import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from './entities/coach.entity';
import { CreateCoachDto, UpdateCoachDto } from './dto/coach.dto';

@Injectable()
export class CoachesService {
  constructor(
    @InjectRepository(Coach)
    private coachesRepository: Repository<Coach>,
  ) {}

  async create(dto: CreateCoachDto): Promise<Coach> {
    const coach = this.coachesRepository.create(dto);
    return this.coachesRepository.save(coach);
  }

  async findAll(page = 1, limit = 20) {
    const [coaches, total] = await this.coachesRepository.findAndCount({
      where: { isActive: true },
      relations: { programs: true },
      order: { rating: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: coaches,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Coach> {
    const coach = await this.coachesRepository.findOne({
      where: { id, isActive: true },
      relations: { programs: true },
    });
    if (!coach) throw new NotFoundException('Coach introuvable');
    return coach;
  }

  async update(id: string, dto: UpdateCoachDto): Promise<Coach> {
    const coach = await this.findOne(id);
    Object.assign(coach, dto);
    return this.coachesRepository.save(coach);
  }

  async remove(id: string) {
    const coach = await this.findOne(id);
    coach.isActive = false;
    await this.coachesRepository.save(coach);
    return { message: 'Coach supprimé avec succès' };
  }
}

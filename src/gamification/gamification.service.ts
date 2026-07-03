import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { Challenge } from './entities/challenge.entity';
import { UserChallenge } from './entities/user-challenge.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateBadgeDto,
  CreateChallengeDto,
  CompleteChallengeDto,
} from './dto/gamification.dto';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(Badge)
    private badgesRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgesRepository: Repository<UserBadge>,
    @InjectRepository(Challenge)
    private challengesRepository: Repository<Challenge>,
    @InjectRepository(UserChallenge)
    private userChallengesRepository: Repository<UserChallenge>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ──── BADGES ────

  async createBadge(dto: CreateBadgeDto): Promise<Badge> {
    const badge = this.badgesRepository.create(dto);
    return this.badgesRepository.save(badge);
  }

  async findAllBadges(): Promise<Badge[]> {
    return this.badgesRepository.find({ where: { isActive: true }, order: { pointsRequired: 'ASC' } });
  }

  async getUserBadges(userId: string) {
    return this.userBadgesRepository.find({
      where: { userId },
      relations: { badge: true },
      order: { earnedDate: 'DESC' },
    });
  }

  async awardBadge(userId: string, badgeId: string) {
    const existing = await this.userBadgesRepository.findOne({ where: { userId, badgeId } });
    if (existing) throw new ConflictException('Badge déjà attribué');

    const userBadge = this.userBadgesRepository.create({ userId, badgeId });
    const saved = await this.userBadgesRepository.save(userBadge);

    // Award badge points to user
    const badge = await this.badgesRepository.findOne({ where: { id: badgeId } });
    if (badge?.pointsRequired) {
      await this.usersRepository.increment({ id: userId }, 'totalPoints', badge.pointsRequired);
    }

    return saved;
  }

  async checkAndAwardBadges(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { sessions: true, userBadges: true },
    });
    if (!user) return;

    const completedSessions = (user.sessions || []).filter((s) => s.completed).length;
    const badges = await this.badgesRepository.find({ where: { isActive: true } });
    const earnedBadgeIds = new Set((user.userBadges || []).map((ub) => ub.badgeId));

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      switch (badge.triggerType) {
        case 'sessions':
          shouldAward = completedSessions >= (badge.triggerValue || 0);
          break;
        case 'streak':
          shouldAward = user.streak >= (badge.triggerValue || 0);
          break;
        case 'points':
          shouldAward = user.totalPoints >= (badge.pointsRequired || 0);
          break;
      }

      if (shouldAward) {
        try {
          await this.awardBadge(userId, badge.id);
        } catch (_) {}
      }
    }
  }

  // ──── CHALLENGES ────

  async createChallenge(dto: CreateChallengeDto): Promise<Challenge> {
    const challenge = this.challengesRepository.create(dto);
    return this.challengesRepository.save(challenge);
  }

  async findAllChallenges(type?: string): Promise<Challenge[]> {
    const where: any = { isActive: true };
    if (type) where.type = type;
    return this.challengesRepository.find({ where, order: { points: 'DESC' } });
  }

  async getUserChallengesForDate(userId: string, date: string) {
    const challenges = await this.challengesRepository.find({ where: { isActive: true } });

    const userChallengesForDate = await this.userChallengesRepository.find({
      where: { userId, challengeDate: date },
      relations: { challenge: true },
    });

    const completedIds = new Set(
      userChallengesForDate.filter((uc) => uc.completed).map((uc) => uc.challengeId),
    );

    return challenges.map((challenge) => ({
      ...challenge,
      completed: completedIds.has(challenge.id),
      userChallengeId: userChallengesForDate.find((uc) => uc.challengeId === challenge.id)?.id,
    }));
  }

  async completeChallenge(dto: CompleteChallengeDto, userId: string) {
    const challenge = await this.challengesRepository.findOne({
      where: { id: dto.challengeId },
    });
    if (!challenge) throw new NotFoundException('Défi introuvable');

    const existing = await this.userChallengesRepository.findOne({
      where: { userId, challengeId: dto.challengeId, challengeDate: dto.challengeDate },
    });

    if (existing?.completed) {
      throw new ConflictException('Défi déjà complété pour cette date');
    }

    if (existing) {
      existing.completed = true;
      existing.completedAt = new Date();
      await this.userChallengesRepository.save(existing);
    } else {
      const uc = this.userChallengesRepository.create({
        userId,
        challengeId: dto.challengeId,
        challengeDate: dto.challengeDate,
        completed: true,
        completedAt: new Date(),
      });
      await this.userChallengesRepository.save(uc);
    }

    // Award points
    await this.usersRepository.increment({ id: userId }, 'totalPoints', challenge.points);

    // Check badge unlocks
    await this.checkAndAwardBadges(userId);

    return { message: `+${challenge.points} points gagnés !`, points: challenge.points };
  }

  async getUserPoints(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return { totalPoints: user.totalPoints };
  }
}
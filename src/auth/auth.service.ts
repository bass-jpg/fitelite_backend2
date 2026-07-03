import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, FitnessLevel } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase(), isActive: true },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async login(user: User) {
    const tokens = await this.generateTokens(user);

    // Save refresh token
    const refreshToken = this.refreshTokenRepository.create({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    await this.refreshTokenRepository.save(refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async register(dto: RegisterDto) {
    // Check for duplicate email
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: dto.password,
      goal: dto.goal || '',
      level: dto.level || FitnessLevel.BEGINNER,
      streak: 0,
      totalSessions: 0,
      totalPoints: 0,
    });

    const saved = await this.usersRepository.save(user);
    const tokens = await this.generateTokens(saved);

    // Save refresh token
    const refreshToken = this.refreshTokenRepository.create({
      token: tokens.refreshToken,
      userId: saved.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepository.save(refreshToken);

    return {
      user: this.sanitizeUser(saved),
      ...tokens,
    };
  }

  async refreshTokens(token: string) {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token, revoked: false },
      relations: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // Rotate refresh token
    storedToken.revoked = true;
    await this.refreshTokenRepository.save(storedToken);

    const tokens = await this.generateTokens(storedToken.user);

    const newRefreshToken = this.refreshTokenRepository.create({
      token: tokens.refreshToken,
      userId: storedToken.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      user: this.sanitizeUser(storedToken.user),
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.refreshTokenRepository.update(
        { userId, token: refreshToken },
        { revoked: true },
      );
    } else {
      // Revoke all tokens for this user
      await this.refreshTokenRepository.update(
        { userId, revoked: false },
        { revoked: true },
      );
    }
    return { message: 'Déconnexion réussie' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    user.password = await bcrypt.hash(dto.newPassword, 12);
    await this.usersRepository.save(user);

    // Revoke all refresh tokens (force re-login)
    await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true },
    );

    return { message: 'Mot de passe modifié avec succès' };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET', 'fittrack_secret'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET', 'fittrack_secret'),
        expiresIn: '30d' as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { password, ...rest } = user as any;
    return rest;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notif = this.notificationsRepository.create(dto);
    return this.notificationsRepository.save(notif);
  }

  async findAll(userId: string, unreadOnly = false, page = 1, limit = 20) {
    const where: any = { userId };
    if (unreadOnly) where.read = false;

    const [data, total] = await this.notificationsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await this.notificationsRepository.count({
      where: { userId, read: false },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.notificationsRepository.findOne({ where: { id, userId } });
    if (!notif) throw new NotFoundException('Notification introuvable');
    notif.read = true;
    return this.notificationsRepository.save(notif);
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.update({ userId, read: false }, { read: true });
    return { message: 'Toutes les notifications marquées comme lues' };
  }

  async remove(id: string, userId: string) {
    const notif = await this.notificationsRepository.findOne({ where: { id, userId } });
    if (!notif) throw new NotFoundException('Notification introuvable');
    await this.notificationsRepository.remove(notif);
    return { message: 'Notification supprimée' };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationsRepository.count({
      where: { userId, read: false },
    });
    return { count };
  }
}
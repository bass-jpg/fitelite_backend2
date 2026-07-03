import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateOrderDto, userId: string): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('La commande doit contenir au moins un article');
    }

    let totalAmount = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of dto.items) {
      const product = await this.productsRepository.findOne({
        where: { id: item.productId, isActive: true },
      });
      if (!product) throw new NotFoundException(`Produit ${item.productId} introuvable`);
      if (!product.inStock) throw new BadRequestException(`${product.name} est en rupture de stock`);

      const subtotal = Number(product.price) * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        subtotal,
      });
    }

    const order = this.ordersRepository.create({
      userId,
      totalAmount,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
    });

    const savedOrder = await this.ordersRepository.save(order);

    for (const item of orderItems) {
      const orderItem = this.orderItemsRepository.create({
        ...item,
        orderId: savedOrder.id,
      });
      await this.orderItemsRepository.save(orderItem);
    }

    return this.findOne(savedOrder.id, userId, UserRole.USER);
  }

  async findAll(userId: string, role: UserRole, page = 1, limit = 20) {
    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (role !== UserRole.ADMIN) {
      qb.where('order.userId = :userId', { userId });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, userId: string, role: UserRole): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { items: { product: true } },
    });

    if (!order) throw new NotFoundException('Commande introuvable');

    if (order.userId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Accès refusé');
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    order.status = dto.status;
    return this.ordersRepository.save(order);
  }

  async cancel(id: string, userId: string, role: UserRole) {
    const order = await this.findOne(id, userId, role);
    if (order.status !== 'pending') {
      throw new BadRequestException('Seules les commandes en attente peuvent être annulées');
    }
    order.status = 'cancelled' as any;
    await this.ordersRepository.save(order);
    return { message: 'Commande annulée' };
  }
}
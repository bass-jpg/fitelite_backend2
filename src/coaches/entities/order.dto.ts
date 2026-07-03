import {
  IsString, IsOptional, IsEnum, IsArray, IsUUID,
  IsNumber, ValidateNested, Min, IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

export class OrderItemDto {
  @ApiProperty() @IsUUID() productId: string;
  @ApiProperty({ example: 2 }) @IsNumber() @Type(() => Number) @Min(1) quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ example: '12 rue de la Paix, Dakar' })
  @IsOptional() @IsString() shippingAddress?: string;

  @ApiPropertyOptional({ example: 'Orange Money' })
  @IsOptional() @IsString() paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus) status: OrderStatus;
}
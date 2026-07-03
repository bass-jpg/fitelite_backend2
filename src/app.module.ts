import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { ExercisesModule } from './exercises/exercises.module';
import { CoachesModule } from './coaches/coaches.module';
import { SessionsModule } from './sessions/sessions.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { GamificationModule } from './gamification/gamification.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WeatherModule } from './weather/weather.module';

// Entities
import { User } from './users/entities/user.entity';
import { Program } from './programs/entities/program.entity';
import { Exercise } from './exercises/entities/exercise.entity';
import { Coach } from './coaches/entities/coach.entity';
import { WorkoutSession } from './sessions/entities/workout-session.entity';
import { Meal } from './nutrition/entities/meal.entity';
import { DailyMenu } from './nutrition/entities/daily-menu.entity';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Badge } from './gamification/entities/badge.entity';
import { UserBadge } from './gamification/entities/user-badge.entity';
import { Challenge } from './gamification/entities/challenge.entity';
import { UserChallenge } from './gamification/entities/user-challenge.entity';
import { Notification } from './notifications/entities/notification.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'fittrack_db'),
        entities: [
          User,
          Program,
          Exercise,
          Coach,
          WorkoutSession,
          Meal,
          DailyMenu,
          Product,
          Order,
          OrderItem,
          Badge,
          UserBadge,
          Challenge,
          UserChallenge,
          Notification,
          RefreshToken,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProgramsModule,
    ExercisesModule,
    CoachesModule,
    SessionsModule,
    NutritionModule,
    ProductsModule,
    OrdersModule,
    GamificationModule,
    NotificationsModule,
    WeatherModule,
  ],
})
export class AppModule {}

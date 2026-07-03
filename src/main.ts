import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('FitTrack API')
    .setDescription(
      `## FitTrack REST API
      
API REST complète pour l'application FitTrack — application de suivi fitness.

### Fonctionnalités principales
- 🔐 **Authentification JWT** avec refresh tokens
- 👤 **Gestion des utilisateurs** avec profils complets
- 🏋️ **Programmes d'entraînement** et exercices
- 🥗 **Nutrition** et suivi des repas
- 🛍️ **Boutique** de produits fitness
- 🏆 **Gamification** : badges, défis, classements
- 🌤️ **Météo** via OpenWeather API
- 👨‍💼 **Rôles** : USER, COACH, ADMIN

### Authentification
Utilisez le endpoint \`/api/auth/login\` pour obtenir un token JWT.  
Ajoutez-le dans l'en-tête : \`Authorization: Bearer <token>\``,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentification et gestion des tokens')
    .addTag('Users', 'Gestion des utilisateurs et profils')
    .addTag('Programs', 'Programmes d\'entraînement')
    .addTag('Exercises', 'Exercices physiques')
    .addTag('Coaches', 'Coaches et entraîneurs')
    .addTag('Sessions', 'Séances d\'entraînement')
    .addTag('Nutrition', 'Repas et nutrition')
    .addTag('Products', 'Boutique de produits')
    .addTag('Orders', 'Commandes')
    .addTag('Gamification', 'Badges, défis et classements')
    .addTag('Notifications', 'Notifications utilisateurs')
    .addTag('Weather', 'Météo via OpenWeather API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 FitTrack API is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger docs:              http://localhost:${port}/api/docs`);
  console.log(`🌍 Environment:               ${process.env.NODE_ENV || 'development'}\n`);
}

bootstrap();

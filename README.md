# 🏋️ FitTrack Backend API

> API REST complète pour l'application FitTrack — construite avec **NestJS**, **TypeORM** et **PostgreSQL**.

---

## 📋 Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Base de données](#base-de-données)
- [Documentation API](#documentation-api)
- [Authentification](#authentification)
- [Rôles & Autorisations](#rôles--autorisations)
- [Modules](#modules)
- [API Externe — OpenWeather](#api-externe--openweather)
- [Git Flow](#git-flow)

---

## 🏗️ Architecture

```
src/
├── auth/                  # JWT, login, register, refresh token
│   ├── dto/
│   ├── entities/          # RefreshToken
│   └── strategies/        # jwt.strategy, local.strategy
├── users/                 # Profils utilisateurs, stats, leaderboard
├── coaches/               # Coaches et entraîneurs
├── programs/              # Programmes d'entraînement
├── exercises/             # Exercices liés aux programmes
├── sessions/              # Séances d'entraînement (historique, progress)
├── nutrition/             # Repas & menus quotidiens
├── products/              # Boutique de produits
├── orders/                # Commandes
├── gamification/          # Badges, défis, points
├── notifications/         # Notifications utilisateurs
├── weather/               # Intégration OpenWeather API
├── common/
│   ├── decorators/        # @CurrentUser, @Roles, @Public
│   ├── filters/           # HttpExceptionFilter
│   ├── guards/            # JwtAuthGuard, RolesGuard
│   └── interceptors/      # TransformInterceptor (envelope)
├── database/
│   └── seed.ts            # Peuplage initial de la BDD
├── app.module.ts
└── main.ts
```

---

## ⚙️ Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** ≥ 14.x
- Clé API **OpenWeather** (gratuite sur [openweathermap.org](https://openweathermap.org/api))

---

## 📦 Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-username/fittrack-backend.git
cd fittrack-backend

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.example .env
```

---

## 🔧 Configuration

Éditez `.env` avec vos valeurs :

```env
# Application
NODE_ENV=development
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=votreMotDePasse
DB_NAME=fittrack_db

# JWT
JWT_SECRET=votre_cle_secrete_tres_longue_et_aleatoire
JWT_EXPIRES_IN=7d

# OpenWeather (https://openweathermap.org → Free plan)
OPENWEATHER_API_KEY=votre_cle_api_openweather

# CORS (URL de votre frontend)
CORS_ORIGIN=http://localhost:5173
```

---

## 🚀 Démarrage

```bash
# Créer la base de données PostgreSQL
psql -U postgres -c "CREATE DATABASE fittrack_db;"

# Mode développement (hot-reload)
npm run start:dev

# Peupler la BDD avec des données de démonstration
npm run seed

# Build production
npm run build
npm run start
```

L'API sera disponible sur :
- **API** : `http://localhost:3000/api`
- **Swagger** : `http://localhost:3000/api/docs`

---

## 🗄️ Base de données

### Schéma relationnel

```
users ──────────────────────────────────────────────────
  │  1:N  workout_sessions
  │  1:N  orders ──── N:1 ── order_items ──── N:1 ── products
  │  1:N  daily_menus ──── N:1 ── meals
  │  1:N  user_badges ──── N:1 ── badges
  │  1:N  user_challenges ──── N:1 ── challenges
  │  1:N  notifications
  └──1:N  refresh_tokens

coaches ─── 1:N ─── programs ─── 1:N ─── exercises
                         │
                    1:N  └── workout_sessions
```

### Seeder — comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@fittrack.com` | `fittrack2024` | ADMIN |
| `aminata@fittrack.com` | `fittrack2024` | USER |
| `moussa@fittrack.com` | `fittrack2024` | USER |
| `marcus@fittrack.com` | `fittrack2024` | COACH |
| `sophie@fittrack.com` | `fittrack2024` | USER |

---

## 📚 Documentation API

La documentation Swagger interactive est disponible à :
**`http://localhost:3000/api/docs`**

### Endpoints principaux

#### 🔐 Auth
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | ❌ Public |
| POST | `/api/auth/login` | Connexion → tokens JWT | ❌ Public |
| POST | `/api/auth/refresh` | Renouveler access token | ❌ Public |
| POST | `/api/auth/logout` | Révoquer refresh token | ✅ JWT |
| GET  | `/api/auth/me` | Profil utilisateur connecté | ✅ JWT |
| PATCH | `/api/auth/change-password` | Changer mot de passe | ✅ JWT |

#### 👤 Users
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/users` | Liste utilisateurs | 🔒 ADMIN |
| GET | `/api/users/leaderboard` | Classement par points | ✅ JWT |
| GET | `/api/users/me/stats` | Mes statistiques | ✅ JWT |
| GET | `/api/users/:id` | Profil utilisateur | ✅ JWT |
| PATCH | `/api/users/:id` | Mettre à jour profil | ✅ JWT (owner/admin) |
| PATCH | `/api/users/:id/role` | Changer rôle | 🔒 ADMIN |
| DELETE | `/api/users/:id` | Désactiver compte | ✅ JWT (owner/admin) |

#### 🏋️ Programs
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/programs` | Liste programmes (filtres) | ❌ Public |
| GET | `/api/programs/:id` | Détails programme + exercices | ❌ Public |
| POST | `/api/programs` | Créer programme | 🔒 ADMIN/COACH |
| PATCH | `/api/programs/:id` | Modifier programme | 🔒 ADMIN/COACH |
| DELETE | `/api/programs/:id` | Supprimer programme | 🔒 ADMIN |

#### 🥗 Nutrition
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/nutrition/meals` | Catalogue repas (filtres) | ❌ Public |
| GET | `/api/nutrition/menus` | Mon historique de menus | ✅ JWT |
| GET | `/api/nutrition/menus/date/:date` | Menu d'une date | ✅ JWT |
| POST | `/api/nutrition/menus` | Créer menu du jour | ✅ JWT |
| PATCH | `/api/nutrition/menus/:id` | Modifier menu | ✅ JWT |

#### 🛍️ Products & Orders
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/products` | Catalogue produits | ❌ Public |
| GET | `/api/orders` | Mes commandes | ✅ JWT |
| POST | `/api/orders` | Passer commande | ✅ JWT |
| DELETE | `/api/orders/:id` | Annuler commande | ✅ JWT |

#### 🏆 Gamification
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/gamification/badges` | Tous les badges | ❌ Public |
| GET | `/api/gamification/badges/me` | Mes badges | ✅ JWT |
| GET | `/api/gamification/challenges/me` | Défis du jour | ✅ JWT |
| POST | `/api/gamification/challenges/complete` | Compléter un défi | ✅ JWT |

#### 🌤️ Météo
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/weather/current?city=Dakar` | Météo actuelle | ✅ JWT |
| GET | `/api/weather/current/coords?lat=14.69&lon=-17.44` | Météo par GPS | ✅ JWT |
| GET | `/api/weather/forecast?city=Dakar&days=5` | Prévisions | ✅ JWT |

---

## 🔐 Authentification

Le système utilise **deux tokens JWT** :

```
                  ┌─────────────────────────────────────────┐
                  │          POST /api/auth/login            │
                  │  { email, password }                     │
                  └──────────────┬──────────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │  access_token  │  (expire en 7j)
                         │  refresh_token │  (expire en 30j)
                         └───────┬────────┘
                                 │
              ┌──────────────────▼──────────────────────────┐
              │  Authorization: Bearer <access_token>        │
              │  → Toutes les routes protégées               │
              └─────────────────────────────────────────────┘
                                 │
              ┌──────────────────▼──────────────────────────┐
              │  POST /api/auth/refresh                      │
              │  { refreshToken }  → nouveaux tokens         │
              └─────────────────────────────────────────────┘
```

---

## 👮 Rôles & Autorisations

| Rôle | Description | Permissions |
|------|-------------|-------------|
| `user` | Utilisateur standard | CRUD ses propres données |
| `coach` | Entraîneur | + Créer/modifier programmes et exercices |
| `admin` | Administrateur | Accès complet à tout |

**Format de réponse uniforme (envelope pattern) :**

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2024-03-18T10:30:00.000Z"
}
```

**Format d'erreur :**

```json
{
  "success": false,
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Token invalide ou expiré",
  "path": "/api/users/me",
  "method": "GET",
  "timestamp": "2024-03-18T10:30:00.000Z"
}
```

---

## 🌤️ API Externe — OpenWeather

L'intégration OpenWeather permet d'afficher la météo sur le tableau de bord.

**Configuration :**
1. Créer un compte gratuit sur [openweathermap.org](https://openweathermap.org/api)
2. Générer une clé API (plan gratuit : 1000 appels/jour)
3. Ajouter `OPENWEATHER_API_KEY=votre_cle` dans `.env`

**Sans clé API :** Des données de démonstration sont retournées automatiquement (aucune erreur).

---

## 🌿 Git Flow

```bash
# Branches principales
main        # Production stable
develop     # Intégration continue

# Branches de fonctionnalité
feature/auth-jwt
feature/programs-crud
feature/gamification
feature/weather-integration

# Workflow
git checkout develop
git checkout -b feature/nom-de-la-feature
# ... développement ...
git add .
git commit -m "feat(auth): add JWT refresh token rotation"
git push origin feature/nom-de-la-feature
# → Pull Request vers develop
```

### Convention de commits

```
feat(module): description courte       # Nouvelle fonctionnalité
fix(module): description courte        # Correction de bug
refactor(module): description          # Refactoring
docs(module): description              # Documentation
test(module): description              # Tests
chore: description                     # Maintenance
```

---

## 🔗 Intégration Frontend

Dans votre application React/Vite, configurez l'URL de base :

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Exemple d'appel authentifié
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const { data } = await response.json();
// data.accessToken, data.refreshToken, data.user
```

---

## 📁 Structure des fichiers finaux

```
fittrack-backend/
├── src/
│   ├── auth/               ✅ JWT + Refresh tokens
│   ├── users/              ✅ CRUD + stats + leaderboard
│   ├── coaches/            ✅ CRUD
│   ├── programs/           ✅ CRUD + filtres
│   ├── exercises/          ✅ CRUD par programme
│   ├── sessions/           ✅ CRUD + progress data
│   ├── nutrition/          ✅ Repas + Menus quotidiens
│   ├── products/           ✅ CRUD boutique
│   ├── orders/             ✅ Commandes + statuts
│   ├── gamification/       ✅ Badges + Défis + Points
│   ├── notifications/      ✅ CRUD + compteur non lus
│   ├── weather/            ✅ OpenWeather API
│   ├── common/             ✅ Guards, Decorators, Filters
│   ├── database/           ✅ Seeder
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

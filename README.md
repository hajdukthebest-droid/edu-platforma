# 🎓 Edu Platforma

## Premium E-Learning Platforma za Farmaceutsku i Zdravstvenu Industriju

Najnaprednija, AI-powered e-learning platforma u Hrvatskoj i regiji koja postavlja nove standarde za online edukaciju u farmaceutskoj i zdravstvenoj industriji.

---

## 📋 Sadržaj

- [Značajke](#-značajke)
- [Tehnologije](#-tehnologije)
- [Preduvjeti](#-preduvjeti)
- [Instalacija](#-instalacija)
- [Pokretanje](#-pokretanje)
- [Struktura Projekta](#-struktura-projekta)
- [API Dokumentacija](#-api-dokumentacija)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## ✨ Značajke

### MVP Funkcionalnosti (v1.0)

- ✅ **Autentikacija i autorizacija**
  - JWT-based authentication
  - Multi-role sistem (Admin, Instructor, Learner, itd.)
  - OAuth 2.0 (Google, Microsoft)

- ✅ **Upravljanje tečajevima**
  - CRUD operacije za tečajeve
  - Modularni sistem (moduli, lekcije)
  - Video, članci, quizzes
  - Kategorije i tagovi

- ✅ **Gamification sistem**
  - Bodovi i razine
  - Badges i achievements
  - Leaderboards
  - Streak tracking

- ✅ **Certifikati**
  - Automatska generacija certifikata
  - CPD/CME bodovi
  - Verifikacija certifikata

- ✅ **Analitika**
  - Progress tracking
  - Learning analytics
  - Instructor dashboards
  - Admin reporting

- ✅ **Responsive dizajn**
  - Mobile-first pristup
  - Tailwind CSS + Shadcn/ui
  - Dark mode support

### Nadolazeće funkcionalnosti

- 🔄 Video upload & streaming
- 🔄 Live sessions & webinars
- 🔄 Forum i discussion boards
- 🔄 Payment integration (Stripe)
- 🔄 Advanced AI features
- 🔄 Mobile apps (iOS & Android)

---

## 🛠 Tehnologije

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Form Management**: React Hook Form + Zod
- **Language**: TypeScript 5+

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript 5+
- **ORM**: Prisma
- **Authentication**: JWT + Passport.js
- **Validation**: Zod

### Database
- **Primary**: PostgreSQL 16+
- **Cache**: Redis (optional)
- **Search**: Elasticsearch (optional)

### DevOps
- **Monorepo**: Turborepo
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Version Control**: Git

---

## 📦 Preduvjeti

Prije nego započnete, provjerite imate li instalirano sljedeće:

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 16.0
- **Git**

Opcionalno (za produkciju):
- **Redis** >= 7.0
- **Docker** & Docker Compose

---

## 🚀 Instalacija

### 1. Clone repozitorija

```bash
git clone https://github.com/yourusername/edu-platforma.git
cd edu-platforma
```

### 2. Instalacija dependencies

```bash
npm install
```

### 3. Postavljanje baze podataka

#### Opcija A: Lokalna PostgreSQL instalacija

1. Kreirajte novu bazu podataka:
```sql
CREATE DATABASE edu_platforma;
```

2. Kopirajte `.env.example` u `.env` za svaki app:

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

3. Uredite `apps/api/.env` i postavite connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/edu_platforma?schema=public"
```

#### Opcija B: Docker (preporučeno za development)

```bash
# Pokrenite PostgreSQL container
docker run --name edu-platforma-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=edu_platforma \
  -p 5432:5432 \
  -d postgres:16
```

### 4. Migracija baze i seed podataka

```bash
cd packages/database

# Generirajte Prisma Client
npm run db:generate

# Pokrenite migracije
npm run db:migrate

# Seed inicijalnih podataka
npm run db:seed
```

### 5. Postavite environment varijable

#### Backend (`apps/api/.env`):

```env
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

DATABASE_URL="postgresql://user:password@localhost:5432/edu_platforma?schema=public"

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_REFRESH_EXPIRES_IN=30d

# Email (optional za development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Frontend (`apps/web/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🏃 Pokretanje

### Development mode

#### Opcija 1: Pokrenite sve aplikacije odjednom (Turborepo)

```bash
# Root directory
npm run dev
```

Ovo će pokrenuti:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

#### Opcija 2: Pokrenite aplikacije pojedinačno

```bash
# Terminal 1 - Backend API
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

### Pristup aplikaciji

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Health Check**: http://localhost:3001/health

### Test korisnici (nakon seed-a)

```
Admin:
Email: admin@edu-platforma.hr
Password: admin123

Instructor:
Email: instructor@edu-platforma.hr
Password: instructor123

Learner:
Email: learner@edu-platforma.hr
Password: learner123
```

---

## 📁 Struktura Projekta

```
edu-platforma/
├── apps/
│   ├── api/                    # Express.js backend
│   │   ├── src/
│   │   │   ├── config/        # Configuration files
│   │   │   ├── controllers/   # Route controllers
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # Business logic
│   │   │   ├── types/         # TypeScript types
│   │   │   ├── utils/         # Utility functions
│   │   │   └── index.ts       # Entry point
│   │   └── package.json
│   │
│   └── web/                    # Next.js frontend
│       ├── src/
│       │   ├── app/           # Next.js App Router pages
│       │   │   ├── (auth)/    # Auth pages (login, register)
│       │   │   ├── courses/   # Course pages
│       │   │   ├── dashboard/ # Dashboard
│       │   │   └── page.tsx   # Home page
│       │   ├── components/    # React components
│       │   │   ├── ui/        # UI components (shadcn/ui)
│       │   │   └── providers/ # Context providers
│       │   ├── lib/           # Utility functions
│       │   ├── hooks/         # Custom React hooks
│       │   └── types/         # TypeScript types
│       └── package.json
│
├── packages/
│   ├── database/              # Prisma database package
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── seed.ts        # Seed data
│   │   └── src/
│   │       └── index.ts       # Prisma client export
│   │
│   ├── types/                 # Shared TypeScript types
│   ├── ui/                    # Shared UI components
│   └── utils/                 # Shared utilities
│
├── docs/                      # Documentation
├── .gitignore
├── package.json               # Root package.json
├── turbo.json                 # Turborepo config
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

---

## 🔌 API Dokumentacija

### Base URL

```
http://localhost:3001/api
```

### Autentikacija

Sve zaštićene rute zahtijevaju JWT token u Authorization headeru:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Auth

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Get Profile** (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Courses

**Get all courses**
```http
GET /api/courses?page=1&limit=20&search=farmakologija
```

**Get course by ID**
```http
GET /api/courses/:id
```

**Get course by slug**
```http
GET /api/courses/slug/:slug
```

**Create course** (Protected - Instructor/Admin)
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Osnove farmakologije",
  "slug": "osnove-farmakologije",
  "description": "Opis tečaja...",
  "level": "BEGINNER",
  "price": 199.99,
  "categoryId": "cat-id"
}
```

**Enroll in course** (Protected)
```http
POST /api/courses/:id/enroll
Authorization: Bearer <token>
```

**Get course progress** (Protected)
```http
GET /api/courses/:id/progress
Authorization: Bearer <token>
```

---

## 🌐 Deployment

### Priprema za produkciju

1. **Build aplikacija**

```bash
npm run build
```

2. **Environment varijable**

Postavite produkcijske environment varijable:

```env
NODE_ENV=production
DATABASE_URL=<production-db-url>
JWT_SECRET=<strong-random-secret>
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Deployment opcije

#### 1. Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel
```

#### 2. Railway / Render (Backend)

1. Povežite Git repozitorij
2. Postavite environment varijable
3. Definirajte build command: `cd apps/api && npm run build`
4. Definirajte start command: `cd apps/api && npm start`

#### 3. Docker (Full stack)

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

#### 4. VPS (DigitalOcean, AWS, etc.)

```bash
# Setup Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <your-repo>
cd edu-platforma

# Install dependencies
npm install

# Build
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start apps/api/dist/index.js --name api
pm2 startup
pm2 save
```

---

## 🗺 Roadmap

### ✅ Phase 1: MVP (Completed)
- User authentication & profiles
- Course management
- Basic gamification
- Certificates
- Basic analytics

### 🔄 Phase 2: Enhanced Features (In Progress)
- Video upload & streaming
- Advanced assessments (quizzes)
- Forum & discussions
- Payment integration
- Email notifications

### 📅 Phase 3: AI & Social (Q2 2025)
- AI recommendations
- Auto content generation
- Social learning features
- Live sessions
- Collaborative tools

### 📅 Phase 4: Enterprise (Q3 2025)
- SSO integration
- White-label capability
- Advanced admin controls
- API & webhooks
- Mobile apps (iOS & Android)

### 📅 Phase 5: Scale (Q4 2025)
- Performance optimization
- Multi-language support
- Advanced AI/ML features
- Blockchain certificates
- Market leadership

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork repozitorij
2. Kreirajte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit promjene (`git commit -m 'Add some AmazingFeature'`)
4. Push na branch (`git push origin feature/AmazingFeature`)
5. Otvorite Pull Request

---

## 📄 License

Copyright © 2025 PharmaVision Solutions D.O.O. All rights reserved.

---

## 📧 Kontakt

**PharmaVision Solutions D.O.O.**

- Email: info@pharmavision.hr
- Web: www.pharmavision.hr
- LinkedIn: [PharmaVision Solutions](https://linkedin.com/company/pharmavision)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)

---

**Made with ❤️ in Croatia**

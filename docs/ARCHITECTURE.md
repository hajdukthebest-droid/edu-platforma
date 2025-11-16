# Arhitektura Edu Platforme

## Pregled

Edu Platforma je izgrađena kao moderna, scalable web aplikacija koristeći microservices arhitekturu i monorepo pristup.

## Arhitekturni dijagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Web App     │  Mobile App  │  Admin Portal│  Authoring Tool│
│  (Next.js)   │  (Future)    │  (Next.js)   │  (Future)      │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                               │
│              (Express.js REST API)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                            │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Auth Service │ Course Svc   │Analytics Svc │ Payment Service│
├──────────────┼──────────────┼──────────────┼────────────────┤
│Gamification  │Certification │ Notification │ Video Service  │
│   Service    │   Service    │   Service    │                │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  PostgreSQL  │    Redis     │  File Storage│  Search Engine │
│  (Prisma)    │   (Cache)    │  (S3/Local)  │  (Future)      │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

## Komponente

### Frontend (Next.js)

**Tehnologije:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui

**Struktura:**
- `/app` - Next.js App Router pages
- `/components` - Reusable React components
- `/lib` - Utility functions & API client
- `/hooks` - Custom React hooks

**Key Features:**
- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes (ako potrebno)
- Optimized images & fonts

### Backend API (Express.js)

**Tehnologije:**
- Node.js 20+
- Express.js
- TypeScript
- Prisma ORM
- JWT authentication

**Struktura:**
- `/controllers` - Request handlers
- `/services` - Business logic
- `/middleware` - Express middleware
- `/routes` - API routes
- `/utils` - Helper functions

**Design Patterns:**
- MVC (Model-View-Controller)
- Service Layer Pattern
- Repository Pattern (via Prisma)

### Database (PostgreSQL + Prisma)

**Schema Organizacija:**
- User Management
- Course Management
- Progress Tracking
- Gamification
- Social Features
- Payments
- Analytics

**Key Features:**
- Type-safe database access
- Automatic migrations
- Seed data for development
- Full-text search (future)
- Vector embeddings for AI (future)

## Data Flow

### Autentikacija

```
User (Browser)
  ↓
Login Form (Next.js)
  ↓
POST /api/auth/login (Express)
  ↓
AuthService.login()
  ↓
Prisma.user.findUnique()
  ↓
bcrypt.compare(password)
  ↓
Generate JWT tokens
  ↓
Return { user, accessToken, refreshToken }
  ↓
Store in localStorage
  ↓
Redirect to Dashboard
```

### Course Enrollment

```
User clicks "Enroll"
  ↓
POST /api/courses/:id/enroll (with JWT)
  ↓
Authenticate middleware
  ↓
CourseService.enrollInCourse()
  ↓
Check if already enrolled
  ↓
Create Enrollment & CourseProgress (Transaction)
  ↓
Update course.enrollmentCount
  ↓
Return enrollment data
  ↓
Update UI
```

## Security

### Authentication & Authorization

- JWT-based authentication
- Access tokens (7 days)
- Refresh tokens (30 days)
- Role-based access control (RBAC)
- Protected routes on frontend & backend

### Data Protection

- Password hashing (bcrypt)
- HTTPS enforced in production
- CORS configuration
- Rate limiting
- Input validation (Zod)
- SQL injection prevention (Prisma)
- XSS protection

## Performance Optimization

### Frontend

- Code splitting (Next.js automatic)
- Image optimization (next/image)
- Font optimization (next/font)
- Lazy loading components
- React Query caching
- Service Worker (future)

### Backend

- Database query optimization
- Connection pooling
- Redis caching (future)
- Compression middleware
- CDN for static assets

### Database

- Proper indexing
- Query optimization
- Pagination
- Eager/lazy loading

## Scalability

### Horizontal Scaling

- Stateless API design
- Session storage in Redis
- Load balancing ready
- Microservices-ready architecture

### Vertical Scaling

- Database optimization
- Caching strategies
- Query optimization
- Resource monitoring

## Monitoring & Logging

### Current

- Morgan HTTP logging
- Winston logging (future)
- Error tracking

### Future

- Sentry for error tracking
- DataDog/Grafana for metrics
- LogRocket for session replay
- Performance monitoring

## Testing Strategy

### Unit Tests

- Jest for backend
- Vitest for frontend
- Test coverage goals: >80%

### Integration Tests

- API endpoint testing
- Database integration tests

### E2E Tests

- Playwright for critical user flows

## Deployment

### Development

```
Local PostgreSQL
↓
Local Next.js dev server (3000)
Local Express server (3001)
```

### Production

```
PostgreSQL (Managed service)
↓
Backend API (Railway/Render)
↓
Frontend (Vercel)
↓
CDN (Cloudflare)
```

## Future Architecture Enhancements

1. **Microservices**
   - Separate services for different domains
   - Event-driven architecture
   - Message queues (RabbitMQ/Kafka)

2. **AI/ML Services**
   - Python FastAPI for ML models
   - Recommendation engine
   - Content generation service

3. **Real-time Features**
   - WebSocket server
   - Live collaboration
   - Real-time notifications

4. **Advanced Caching**
   - Redis for session & data caching
   - CDN for assets
   - Database query caching

5. **Search**
   - Elasticsearch for full-text search
   - Advanced filtering
   - Fuzzy matching

---

Last updated: 2025-01-16

# API Dokumentacija

## Base URL

```
Development: http://localhost:3001/api
Production: https://api.yourdomain.com/api
```

## Autentikacija

Sve zaštićene rute zahtijevaju JWT token u Authorization header-u:

```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### Register

Kreiraj novi korisnički račun.

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "LEARNER",
      "avatar": null,
      "createdAt": "2025-01-16T12:00:00.000Z"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Login

Prijavi se na postojeći račun.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "LEARNER",
      "avatar": null
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Get Profile

Dohvati podatke trenutno prijavljenog korisnika.

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "clx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": null,
    "bio": null,
    "role": "LEARNER",
    "profession": null,
    "organization": null,
    "totalPoints": 0,
    "level": 1,
    "currentStreak": 0,
    "createdAt": "2025-01-16T12:00:00.000Z"
  }
}
```

---

## Course Endpoints

### Get All Courses

Dohvati popis svih tečajeva s paginacijom i filterima.

```http
GET /api/courses?page=1&limit=20&search=farmakologija&level=BEGINNER&status=PUBLISHED
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by title or description
- `category` (optional): Filter by category ID
- `level` (optional): Filter by level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- `status` (optional): Filter by status (DRAFT, PUBLISHED, ARCHIVED)

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "courses": [
      {
        "id": "clx...",
        "title": "Osnove farmakologije",
        "slug": "osnove-farmakologije",
        "description": "Sveobuhvatan tečaj...",
        "shortDescription": "Naučite osnovne principe...",
        "thumbnail": "/images/courses/...",
        "level": "BEGINNER",
        "status": "PUBLISHED",
        "price": "199.99",
        "duration": 480,
        "enrollmentCount": 150,
        "averageRating": 4.8,
        "totalReviews": 32,
        "creator": {
          "id": "clx...",
          "firstName": "Ana",
          "lastName": "Horvat",
          "avatar": null
        },
        "category": {
          "id": "clx...",
          "name": "Farmakologija",
          "slug": "farmakologija"
        },
        "_count": {
          "enrollments": 150,
          "reviews": 32
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Get Course by ID

Dohvati detaljne informacije o tečaju.

```http
GET /api/courses/:id
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "clx...",
    "title": "Osnove farmakologije",
    "slug": "osnove-farmakologije",
    "description": "Detaljan opis tečaja...",
    "level": "BEGINNER",
    "price": "199.99",
    "duration": 480,
    "tags": ["farmakologija", "osnove"],
    "learningObjectives": [
      "Razumjeti osnovne principe farmakologije",
      "Poznavati farmakokinetičke procese"
    ],
    "creator": {
      "id": "clx...",
      "firstName": "Ana",
      "lastName": "Horvat",
      "avatar": null,
      "bio": "Profesor farmakologije..."
    },
    "category": {
      "id": "clx...",
      "name": "Farmakologija"
    },
    "modules": [
      {
        "id": "clx...",
        "title": "Uvod u farmakologiju",
        "description": "Osnovni pojmovi...",
        "orderIndex": 0,
        "duration": 120,
        "lessons": [
          {
            "id": "clx...",
            "title": "Što je farmakologija?",
            "type": "VIDEO",
            "duration": 15,
            "orderIndex": 0,
            "isPreview": true
          }
        ]
      }
    ]
  }
}
```

### Get Course by Slug

Dohvati tečaj pomoću slug-a (SEO-friendly URL).

```http
GET /api/courses/slug/:slug
```

**Response**: Isti format kao `GET /api/courses/:id`

### Create Course

Kreiraj novi tečaj (samo Instructor/Admin).

```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Klinička farmakologija",
  "slug": "klinicka-farmakologija",
  "description": "Tečaj o primjeni farmakologije u kliničkoj praksi",
  "shortDescription": "Praktični pristup kliničkoj farmakologiji",
  "level": "INTERMEDIATE",
  "price": 299.99,
  "duration": 600,
  "categoryId": "clx...",
  "tags": ["klinika", "farmakologija"],
  "learningObjectives": [
    "Razumjeti kliničku primjenu lijekova",
    "Poznavanje interakcija lijekova"
  ]
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "id": "clx...",
    "title": "Klinička farmakologija",
    "slug": "klinicka-farmakologija",
    ...
  }
}
```

### Enroll in Course

Upiši se na tečaj.

```http
POST /api/courses/:id/enroll
Authorization: Bearer <token>
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "enrollment": {
      "id": "clx...",
      "userId": "clx...",
      "courseId": "clx...",
      "status": "ACTIVE",
      "startedAt": "2025-01-16T12:00:00.000Z"
    },
    "progress": {
      "id": "clx...",
      "userId": "clx...",
      "courseId": "clx...",
      "completedLessons": 0,
      "totalLessons": 15,
      "progressPercentage": 0
    }
  }
}
```

### Get Course Progress

Dohvati progress korisnika za određeni tečaj.

```http
GET /api/courses/:id/progress
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "clx...",
    "userId": "clx...",
    "courseId": "clx...",
    "completedLessons": 5,
    "totalLessons": 15,
    "progressPercentage": 33.33,
    "totalTimeSpent": 3600,
    "lastAccessedAt": "2025-01-16T14:30:00.000Z"
  }
}
```

---

## Error Responses

Svi error responses slijede sljedeći format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

### Example Error Response (Validation)

```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

Last updated: 2025-01-16

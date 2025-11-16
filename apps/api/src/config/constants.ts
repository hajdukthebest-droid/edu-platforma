export const APP_NAME = 'Edu Platforma'
export const APP_VERSION = '1.0.0'

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  LEARNER: 'LEARNER',
  MANAGER: 'MANAGER',
  PHARMACIST: 'PHARMACIST',
  PHARMACY_TECHNICIAN: 'PHARMACY_TECHNICIAN',
  MEDICAL_REP: 'MEDICAL_REP',
  CLINICAL_RESEARCHER: 'CLINICAL_RESEARCHER',
  REGULATOR: 'REGULATOR',
} as const

export const GAMIFICATION = {
  POINTS: {
    COURSE_COMPLETION: 100,
    LESSON_COMPLETION: 20,
    QUIZ_PASSED: 50,
    PERFECT_SCORE: 100,
    FIRST_ATTEMPT_PASS: 25,
    DAILY_STREAK: 10,
    FORUM_POST: 5,
    HELPFUL_ANSWER: 10,
    PEER_REVIEW: 15,
  },
  LEVELS: [
    { level: 1, name: 'Novice', minPoints: 0 },
    { level: 2, name: 'Learner', minPoints: 100 },
    { level: 3, name: 'Student', minPoints: 250 },
    { level: 4, name: 'Scholar', minPoints: 500 },
    { level: 5, name: 'Expert', minPoints: 1000 },
    { level: 6, name: 'Master', minPoints: 2500 },
    { level: 7, name: 'Guru', minPoints: 5000 },
    { level: 8, name: 'Legend', minPoints: 10000 },
  ],
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
}

export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
}

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
}

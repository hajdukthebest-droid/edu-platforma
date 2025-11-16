/**
 * Achievement Definitions
 * Defines all available achievements in the platform
 */

export enum AchievementType {
  // Learning Progress
  FIRST_LESSON = 'FIRST_LESSON',
  COURSE_COMPLETED = 'COURSE_COMPLETED',
  COURSES_5 = 'COURSES_5',
  COURSES_10 = 'COURSES_10',
  COURSES_25 = 'COURSES_25',
  COURSES_50 = 'COURSES_50',

  // Engagement
  FIRST_REVIEW = 'FIRST_REVIEW',
  REVIEWS_10 = 'REVIEWS_10',
  FIRST_FORUM_POST = 'FIRST_FORUM_POST',
  FORUM_POSTS_25 = 'FORUM_POSTS_25',
  HELPFUL_REVIEWER = 'HELPFUL_REVIEWER', // 50+ helpful votes on reviews

  // Streak
  STREAK_7_DAYS = 'STREAK_7_DAYS',
  STREAK_30_DAYS = 'STREAK_30_DAYS',
  STREAK_100_DAYS = 'STREAK_100_DAYS',
  STREAK_365_DAYS = 'STREAK_365_DAYS',

  // Social
  FIRST_FRIEND = 'FIRST_FRIEND',
  SOCIAL_BUTTERFLY = 'SOCIAL_BUTTERFLY', // 10+ friends
  COMMUNITY_LEADER = 'COMMUNITY_LEADER', // Top 10% in forum engagement

  // Certificates & Skills
  FIRST_CERTIFICATE = 'FIRST_CERTIFICATE',
  CERTIFICATES_5 = 'CERTIFICATES_5',
  CERTIFICATES_10 = 'CERTIFICATES_10',
  CPD_MASTER = 'CPD_MASTER', // 100+ CPD points
  CME_EXPERT = 'CME_EXPERT', // 50+ CME credits

  // Domain Mastery
  DOMAIN_EXPLORER = 'DOMAIN_EXPLORER', // Enrolled in 3+ domains
  DOMAIN_MASTER = 'DOMAIN_MASTER', // Completed all courses in one domain
  MULTI_SPECIALIST = 'MULTI_SPECIALIST', // Mastered 3+ domains

  // Instructor Achievements
  FIRST_COURSE_PUBLISHED = 'FIRST_COURSE_PUBLISHED',
  POPULAR_INSTRUCTOR = 'POPULAR_INSTRUCTOR', // 100+ students
  ELITE_INSTRUCTOR = 'ELITE_INSTRUCTOR', // 1000+ students
  FIVE_STAR_TEACHER = 'FIVE_STAR_TEACHER', // 4.5+ average rating with 50+ reviews

  // Special
  EARLY_ADOPTER = 'EARLY_ADOPTER', // Joined in first month
  PLATFORM_CHAMPION = 'PLATFORM_CHAMPION', // Invited 10+ users
  PERFECT_SCORE = 'PERFECT_SCORE', // 100% on a quiz
  SPEED_LEARNER = 'SPEED_LEARNER', // Complete course in 1 day
  NIGHT_OWL = 'NIGHT_OWL', // Complete lessons after midnight
  WEEKEND_WARRIOR = 'WEEKEND_WARRIOR', // Complete 10+ lessons on weekends
}

export interface AchievementCriteria {
  type: 'count' | 'streak' | 'rating' | 'percentage' | 'date' | 'custom'
  target?: number
  field?: string
  condition?: string
}

export interface AchievementDefinition {
  key: AchievementType
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  icon: string // emoji or icon name
  points: number
  criteria: AchievementCriteria
  category: 'learning' | 'engagement' | 'streak' | 'social' | 'certificate' | 'instructor' | 'special'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ============================================
  // LEARNING PROGRESS
  // ============================================
  {
    key: AchievementType.FIRST_LESSON,
    name: 'Prvi Korak',
    nameEn: 'First Steps',
    description: 'Završite svoju prvu lekciju',
    descriptionEn: 'Complete your first lesson',
    icon: '🎯',
    points: 10,
    criteria: { type: 'count', target: 1, field: 'lessonsCompleted' },
    category: 'learning',
    rarity: 'common',
  },
  {
    key: AchievementType.COURSE_COMPLETED,
    name: 'Završitelj',
    nameEn: 'Course Finisher',
    description: 'Završite svoj prvi tečaj',
    descriptionEn: 'Complete your first course',
    icon: '✅',
    points: 50,
    criteria: { type: 'count', target: 1, field: 'coursesCompleted' },
    category: 'learning',
    rarity: 'common',
  },
  {
    key: AchievementType.COURSES_5,
    name: 'Marljiv Student',
    nameEn: 'Diligent Student',
    description: 'Završite 5 tečajeva',
    descriptionEn: 'Complete 5 courses',
    icon: '📚',
    points: 100,
    criteria: { type: 'count', target: 5, field: 'coursesCompleted' },
    category: 'learning',
    rarity: 'uncommon',
  },
  {
    key: AchievementType.COURSES_10,
    name: 'Akademik',
    nameEn: 'Academic',
    description: 'Završite 10 tečajeva',
    descriptionEn: 'Complete 10 courses',
    icon: '🎓',
    points: 200,
    criteria: { type: 'count', target: 10, field: 'coursesCompleted' },
    category: 'learning',
    rarity: 'rare',
  },
  {
    key: AchievementType.COURSES_25,
    name: 'Stručnjak',
    nameEn: 'Expert',
    description: 'Završite 25 tečajeva',
    descriptionEn: 'Complete 25 courses',
    icon: '👨‍🎓',
    points: 500,
    criteria: { type: 'count', target: 25, field: 'coursesCompleted' },
    category: 'learning',
    rarity: 'epic',
  },
  {
    key: AchievementType.COURSES_50,
    name: 'Majstor Znanja',
    nameEn: 'Knowledge Master',
    description: 'Završite 50 tečajeva',
    descriptionEn: 'Complete 50 courses',
    icon: '🏆',
    points: 1000,
    criteria: { type: 'count', target: 50, field: 'coursesCompleted' },
    category: 'learning',
    rarity: 'legendary',
  },

  // ============================================
  // ENGAGEMENT
  // ============================================
  {
    key: AchievementType.FIRST_REVIEW,
    name: 'Prvi Komentar',
    nameEn: 'First Review',
    description: 'Napišite svoju prvu recenziju',
    descriptionEn: 'Write your first review',
    icon: '⭐',
    points: 15,
    criteria: { type: 'count', target: 1, field: 'reviewsWritten' },
    category: 'engagement',
    rarity: 'common',
  },
  {
    key: AchievementType.REVIEWS_10,
    name: 'Kritičar',
    nameEn: 'Critic',
    description: 'Napišite 10 recenzija',
    descriptionEn: 'Write 10 reviews',
    icon: '📝',
    points: 75,
    criteria: { type: 'count', target: 10, field: 'reviewsWritten' },
    category: 'engagement',
    rarity: 'uncommon',
  },
  {
    key: AchievementType.FIRST_FORUM_POST,
    name: 'Konverzacionist',
    nameEn: 'Conversationalist',
    description: 'Kreirajte svoju prvu forum temu',
    descriptionEn: 'Create your first forum post',
    icon: '💬',
    points: 20,
    criteria: { type: 'count', target: 1, field: 'forumPosts' },
    category: 'engagement',
    rarity: 'common',
  },
  {
    key: AchievementType.FORUM_POSTS_25,
    name: 'Forum Veteran',
    nameEn: 'Forum Veteran',
    description: 'Kreirajte 25 forum tema',
    descriptionEn: 'Create 25 forum posts',
    icon: '🗣️',
    points: 150,
    criteria: { type: 'count', target: 25, field: 'forumPosts' },
    category: 'engagement',
    rarity: 'rare',
  },
  {
    key: AchievementType.HELPFUL_REVIEWER,
    name: 'Korisni Kritičar',
    nameEn: 'Helpful Reviewer',
    description: 'Dobijte 50+ helpful glasova na recenzijama',
    descriptionEn: 'Get 50+ helpful votes on your reviews',
    icon: '👍',
    points: 200,
    criteria: { type: 'count', target: 50, field: 'helpfulVotes' },
    category: 'engagement',
    rarity: 'epic',
  },

  // ============================================
  // STREAK
  // ============================================
  {
    key: AchievementType.STREAK_7_DAYS,
    name: 'Sedmodnevni',
    nameEn: 'Week Warrior',
    description: 'Učite 7 dana zaredom',
    descriptionEn: 'Learn for 7 days in a row',
    icon: '🔥',
    points: 50,
    criteria: { type: 'streak', target: 7 },
    category: 'streak',
    rarity: 'uncommon',
  },
  {
    key: AchievementType.STREAK_30_DAYS,
    name: 'Mjesečni Borac',
    nameEn: 'Month Master',
    description: 'Učite 30 dana zaredom',
    descriptionEn: 'Learn for 30 days in a row',
    icon: '🔥',
    points: 200,
    criteria: { type: 'streak', target: 30 },
    category: 'streak',
    rarity: 'rare',
  },
  {
    key: AchievementType.STREAK_100_DAYS,
    name: 'Stodnevni Heroj',
    nameEn: 'Centurion',
    description: 'Učite 100 dana zaredom',
    descriptionEn: 'Learn for 100 days in a row',
    icon: '🔥',
    points: 500,
    criteria: { type: 'streak', target: 100 },
    category: 'streak',
    rarity: 'epic',
  },
  {
    key: AchievementType.STREAK_365_DAYS,
    name: 'Godišnji Šampion',
    nameEn: 'Year Champion',
    description: 'Učite 365 dana zaredom',
    descriptionEn: 'Learn for 365 days in a row',
    icon: '💎',
    points: 2000,
    criteria: { type: 'streak', target: 365 },
    category: 'streak',
    rarity: 'legendary',
  },

  // ============================================
  // CERTIFICATES & SKILLS
  // ============================================
  {
    key: AchievementType.FIRST_CERTIFICATE,
    name: 'Certificirani',
    nameEn: 'Certified',
    description: 'Zaradite svoj prvi certifikat',
    descriptionEn: 'Earn your first certificate',
    icon: '📜',
    points: 100,
    criteria: { type: 'count', target: 1, field: 'certificates' },
    category: 'certificate',
    rarity: 'uncommon',
  },
  {
    key: AchievementType.CERTIFICATES_5,
    name: 'Kolekcionar Certifikata',
    nameEn: 'Certificate Collector',
    description: 'Zaradite 5 certifikata',
    descriptionEn: 'Earn 5 certificates',
    icon: '🎖️',
    points: 250,
    criteria: { type: 'count', target: 5, field: 'certificates' },
    category: 'certificate',
    rarity: 'rare',
  },
  {
    key: AchievementType.CERTIFICATES_10,
    name: 'Diploma Majstor',
    nameEn: 'Diploma Master',
    description: 'Zaradite 10 certifikata',
    descriptionEn: 'Earn 10 certificates',
    icon: '🏅',
    points: 500,
    criteria: { type: 'count', target: 10, field: 'certificates' },
    category: 'certificate',
    rarity: 'epic',
  },
  {
    key: AchievementType.CPD_MASTER,
    name: 'CPD Majstor',
    nameEn: 'CPD Master',
    description: 'Skupite 100+ CPD bodova',
    descriptionEn: 'Collect 100+ CPD points',
    icon: '🎯',
    points: 300,
    criteria: { type: 'count', target: 100, field: 'cpdPoints' },
    category: 'certificate',
    rarity: 'rare',
  },
  {
    key: AchievementType.CME_EXPERT,
    name: 'CME Ekspert',
    nameEn: 'CME Expert',
    description: 'Skupite 50+ CME kredita',
    descriptionEn: 'Collect 50+ CME credits',
    icon: '⚕️',
    points: 300,
    criteria: { type: 'count', target: 50, field: 'cmeCredits' },
    category: 'certificate',
    rarity: 'rare',
  },

  // ============================================
  // DOMAIN MASTERY
  // ============================================
  {
    key: AchievementType.DOMAIN_EXPLORER,
    name: 'Istraživač Domena',
    nameEn: 'Domain Explorer',
    description: 'Upišite se u tečajeve iz 3 različite domene',
    descriptionEn: 'Enroll in courses from 3 different domains',
    icon: '🗺️',
    points: 75,
    criteria: { type: 'count', target: 3, field: 'domainsEnrolled' },
    category: 'learning',
    rarity: 'uncommon',
  },
  {
    key: AchievementType.DOMAIN_MASTER,
    name: 'Majstor Domene',
    nameEn: 'Domain Master',
    description: 'Završite sve tečajeve u jednoj domeni',
    descriptionEn: 'Complete all courses in one domain',
    icon: '👑',
    points: 500,
    criteria: { type: 'custom', condition: 'completedAllInDomain' },
    category: 'learning',
    rarity: 'epic',
  },
  {
    key: AchievementType.MULTI_SPECIALIST,
    name: 'Višestruki Specijalista',
    nameEn: 'Multi-Specialist',
    description: 'Osvojite 3+ domene',
    descriptionEn: 'Master 3+ domains',
    icon: '🌟',
    points: 1500,
    criteria: { type: 'count', target: 3, field: 'domainsMastered' },
    category: 'learning',
    rarity: 'legendary',
  },

  // ============================================
  // INSTRUCTOR ACHIEVEMENTS
  // ============================================
  {
    key: AchievementType.FIRST_COURSE_PUBLISHED,
    name: 'Novi Instruktor',
    nameEn: 'New Instructor',
    description: 'Objavite svoj prvi tečaj',
    descriptionEn: 'Publish your first course',
    icon: '🎬',
    points: 100,
    criteria: { type: 'count', target: 1, field: 'coursesPublished' },
    category: 'instructor',
    rarity: 'uncommon',
  },
  {
    key: AchievementType.POPULAR_INSTRUCTOR,
    name: 'Popularan Instruktor',
    nameEn: 'Popular Instructor',
    description: 'Dosegnite 100+ studenata',
    descriptionEn: 'Reach 100+ students',
    icon: '📊',
    points: 300,
    criteria: { type: 'count', target: 100, field: 'totalStudents' },
    category: 'instructor',
    rarity: 'rare',
  },
  {
    key: AchievementType.ELITE_INSTRUCTOR,
    name: 'Elitni Instruktor',
    nameEn: 'Elite Instructor',
    description: 'Dosegnite 1000+ studenata',
    descriptionEn: 'Reach 1000+ students',
    icon: '🌟',
    points: 1000,
    criteria: { type: 'count', target: 1000, field: 'totalStudents' },
    category: 'instructor',
    rarity: 'legendary',
  },
  {
    key: AchievementType.FIVE_STAR_TEACHER,
    name: 'Pet Zvjezdica',
    nameEn: 'Five Star Teacher',
    description: 'Imajte 4.5+ ocjenu sa 50+ recenzija',
    descriptionEn: 'Have 4.5+ rating with 50+ reviews',
    icon: '⭐',
    points: 500,
    criteria: { type: 'rating', target: 4.5, field: 'averageRating' },
    category: 'instructor',
    rarity: 'epic',
  },

  // ============================================
  // SPECIAL ACHIEVEMENTS
  // ============================================
  {
    key: AchievementType.EARLY_ADOPTER,
    name: 'Rani Korisnik',
    nameEn: 'Early Adopter',
    description: 'Pridružite se u prvom mjesecu platforme',
    descriptionEn: 'Join in the first month of the platform',
    icon: '🚀',
    points: 250,
    criteria: { type: 'date', condition: 'firstMonth' },
    category: 'special',
    rarity: 'rare',
  },
  {
    key: AchievementType.PLATFORM_CHAMPION,
    name: 'Šampion Platforme',
    nameEn: 'Platform Champion',
    description: 'Pozovite 10+ korisnika',
    descriptionEn: 'Invite 10+ users',
    icon: '📢',
    points: 300,
    criteria: { type: 'count', target: 10, field: 'referrals' },
    category: 'special',
    rarity: 'epic',
  },
  {
    key: AchievementType.PERFECT_SCORE,
    name: 'Savršenstvo',
    nameEn: 'Perfection',
    description: 'Ostvarite 100% na testu',
    descriptionEn: 'Score 100% on a quiz',
    icon: '💯',
    points: 100,
    criteria: { type: 'percentage', target: 100, field: 'quizScore' },
    category: 'special',
    rarity: 'uncommon',
  },
  {
    key: AchievementType.SPEED_LEARNER,
    name: 'Brzi Učenik',
    nameEn: 'Speed Learner',
    description: 'Završite tečaj u jednom danu',
    descriptionEn: 'Complete a course in one day',
    icon: '⚡',
    points: 150,
    criteria: { type: 'custom', condition: 'courseInOneDay' },
    category: 'special',
    rarity: 'rare',
  },
  {
    key: AchievementType.NIGHT_OWL,
    name: 'Noćna Sova',
    nameEn: 'Night Owl',
    description: 'Završite lekcije poslije ponoći',
    descriptionEn: 'Complete lessons after midnight',
    icon: '🦉',
    points: 50,
    criteria: { type: 'custom', condition: 'afterMidnight' },
    category: 'special',
    rarity: 'uncommon',
  },
  {
    key: AchievementType.WEEKEND_WARRIOR,
    name: 'Vikend Ratnik',
    nameEn: 'Weekend Warrior',
    description: 'Završite 10+ lekcija vikendom',
    descriptionEn: 'Complete 10+ lessons on weekends',
    icon: '🏃',
    points: 100,
    criteria: { type: 'count', target: 10, field: 'weekendLessons' },
    category: 'special',
    rarity: 'uncommon',
  },
]

/**
 * Get achievement definition by key
 */
export const getAchievementDefinition = (key: AchievementType): AchievementDefinition | undefined => {
  return ACHIEVEMENT_DEFINITIONS.find(def => def.key === key)
}

/**
 * Get all achievements by category
 */
export const getAchievementsByCategory = (category: string): AchievementDefinition[] => {
  return ACHIEVEMENT_DEFINITIONS.filter(def => def.category === category)
}

/**
 * Get all achievements by rarity
 */
export const getAchievementsByRarity = (rarity: string): AchievementDefinition[] => {
  return ACHIEVEMENT_DEFINITIONS.filter(def => def.rarity === rarity)
}

/**
 * Get rarity color
 */
export const getRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: '#9CA3AF',
    uncommon: '#22C55E',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B',
  }
  return colors[rarity] || colors.common
}

/**
 * Get rarity label
 */
export const getRarityLabel = (rarity: string): string => {
  const labels: Record<string, string> = {
    common: 'Uobičajeno',
    uncommon: 'Neuobičajeno',
    rare: 'Rijetko',
    epic: 'Epsko',
    legendary: 'Legendarno',
  }
  return labels[rarity] || labels.common
}

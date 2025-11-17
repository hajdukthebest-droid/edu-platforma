import { Router } from 'express'
import authRoutes from './authRoutes'
import courseRoutes from './courseRoutes'
import assessmentRoutes from './assessmentRoutes'
import certificateRoutes from './certificateRoutes'
import progressRoutes from './progressRoutes'
import instructorRoutes from './instructorRoutes'
import instructorAnalyticsRoutes from './instructorAnalyticsRoutes'
import leaderboardRoutes from './leaderboardRoutes'
import forumRoutes from './forumRoutes'
import notificationRoutes from './notificationRoutes'
import reviewRoutes from './reviewRoutes'
import adminRoutes from './adminRoutes'
import learningPathRoutes from './learningPathRoutes'
import achievementRoutes from './achievementRoutes'
import noteRoutes from './noteRoutes'
import bookmarkRoutes from './bookmarkRoutes'
import profileRoutes from './profileRoutes'
import uploadRoutes from './uploadRoutes'
import messageRoutes from './messageRoutes'
import paymentRoutes from './paymentRoutes'
import recommendationRoutes from './recommendationRoutes'
import domainRoutes from './domainRoutes'
import searchRoutes from './searchRoutes'
import liveSessionRoutes from './liveSessionRoutes'
import courseBuilderRoutes from './courseBuilderRoutes'
import aiRoutes from './aiRoutes'
import mobileRoutes from './mobileRoutes'
import analyticsRoutes from './analyticsRoutes'
import versionRoutes from './versionRoutes'
import videoQuizRoutes from './videoQuizRoutes'
import flashcardRoutes from './flashcardRoutes'

const router = Router()

// Payment routes (must be before body parsing middleware for webhooks)
router.use('/payments', paymentRoutes)

router.use('/auth', authRoutes)
router.use('/domains', domainRoutes)
router.use('/courses', courseRoutes)
router.use('/assessments', assessmentRoutes)
router.use('/certificates', certificateRoutes)
router.use('/progress', progressRoutes)
router.use('/instructor', instructorRoutes)
router.use('/instructor/analytics', instructorAnalyticsRoutes)
router.use('/leaderboard', leaderboardRoutes)
router.use('/forum', forumRoutes)
router.use('/notifications', notificationRoutes)
router.use('/admin', adminRoutes)
router.use('/learning-paths', learningPathRoutes)
router.use('/', achievementRoutes)
router.use('/', reviewRoutes)
router.use('/', noteRoutes)
router.use('/', bookmarkRoutes)
router.use('/', profileRoutes)
router.use('/upload', uploadRoutes)
router.use('/messages', messageRoutes)
router.use('/recommendations', recommendationRoutes)
router.use('/search', searchRoutes)
router.use('/live-sessions', liveSessionRoutes)
router.use('/course-builder', courseBuilderRoutes)
router.use('/ai', aiRoutes)
router.use('/mobile', mobileRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/versions', versionRoutes)
router.use('/video-quizzes', videoQuizRoutes)
router.use('/flashcards', flashcardRoutes)

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'Edu Platforma API',
    version: '1.0.0',
    description: 'Sveobuhvatna multi-domain e-learning platforma',
    endpoints: {
      auth: '/api/auth',
      domains: '/api/domains',
      courses: '/api/courses',
      assessments: '/api/assessments',
      certificates: '/api/certificates',
      progress: '/api/progress',
      instructor: '/api/instructor',
      leaderboard: '/api/leaderboard',
      forum: '/api/forum',
      notifications: '/api/notifications',
      reviews: '/api/courses/:courseId/reviews',
      admin: '/api/admin',
      learningPaths: '/api/learning-paths',
      achievements: '/api/achievements',
      badges: '/api/badges',
      notes: '/api/notes',
      bookmarks: '/api/bookmarks',
      profile: '/api/profile/:username',
      upload: '/api/upload',
      messages: '/api/messages',
      payments: '/api/payments',
      recommendations: '/api/recommendations',
      search: '/api/search',
      liveSessions: '/api/live-sessions',
      courseBuilder: '/api/course-builder',
      ai: '/api/ai',
      mobile: '/api/mobile',
      analytics: '/api/analytics',
      versions: '/api/versions',
      videoQuizzes: '/api/video-quizzes',
      flashcards: '/api/flashcards',
    },
  })
})

export default router

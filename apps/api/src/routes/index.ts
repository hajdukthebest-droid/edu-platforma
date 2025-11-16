import { Router } from 'express'
import authRoutes from './authRoutes'
import courseRoutes from './courseRoutes'
import assessmentRoutes from './assessmentRoutes'
import certificateRoutes from './certificateRoutes'
import progressRoutes from './progressRoutes'
import instructorRoutes from './instructorRoutes'
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

const router = Router()

router.use('/auth', authRoutes)
router.use('/courses', courseRoutes)
router.use('/assessments', assessmentRoutes)
router.use('/certificates', certificateRoutes)
router.use('/progress', progressRoutes)
router.use('/instructor', instructorRoutes)
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

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'Edu Platforma API',
    version: '1.0.0',
    description: 'Premium e-learning platforma za farmaceutsku i zdravstvenu industriju',
    endpoints: {
      auth: '/api/auth',
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
    },
  })
})

export default router

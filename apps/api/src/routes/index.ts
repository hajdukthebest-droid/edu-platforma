import { Router } from 'express'
import authRoutes from './authRoutes'
import courseRoutes from './courseRoutes'
import assessmentRoutes from './assessmentRoutes'
import certificateRoutes from './certificateRoutes'
import progressRoutes from './progressRoutes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/courses', courseRoutes)
router.use('/assessments', assessmentRoutes)
router.use('/certificates', certificateRoutes)
router.use('/progress', progressRoutes)

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
    },
  })
})

export default router

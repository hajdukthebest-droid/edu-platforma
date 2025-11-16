import { Router } from 'express'
import authRoutes from './authRoutes'
import courseRoutes from './courseRoutes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/courses', courseRoutes)

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'Edu Platforma API',
    version: '1.0.0',
    description: 'Premium e-learning platforma za farmaceutsku i zdravstvenu industriju',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
    },
  })
})

export default router

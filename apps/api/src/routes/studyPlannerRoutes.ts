import { Router } from 'express'
import studyPlannerController from '../controllers/studyPlannerController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// ============================================
// STUDY PLAN
// ============================================

// Get my study plan
router.get('/plan', studyPlannerController.getStudyPlan)

// Update my study plan
router.put('/plan', studyPlannerController.updateStudyPlan)

// Get study summary
router.get('/summary', studyPlannerController.getStudySummary)

// ============================================
// STUDY SESSIONS
// ============================================

// Create study session
router.post('/sessions', studyPlannerController.createSession)

// Get my sessions
router.get('/sessions', studyPlannerController.getSessions)

// Get single session
router.get('/sessions/:id', studyPlannerController.getSession)

// Update session
router.put('/sessions/:id', studyPlannerController.updateSession)

// Delete session
router.delete('/sessions/:id', studyPlannerController.deleteSession)

// Start session
router.post('/sessions/:id/start', studyPlannerController.startSession)

// Complete session
router.post('/sessions/:id/complete', studyPlannerController.completeSession)

// Mark session as missed
router.post('/sessions/:id/missed', studyPlannerController.markSessionMissed)

// ============================================
// STUDY GOALS
// ============================================

// Create goal
router.post('/goals', studyPlannerController.createGoal)

// Get my goals
router.get('/goals', studyPlannerController.getGoals)

// Update goal
router.put('/goals/:id', studyPlannerController.updateGoal)

// Delete goal
router.delete('/goals/:id', studyPlannerController.deleteGoal)

// Update goal progress
router.post('/goals/:id/progress', studyPlannerController.updateGoalProgress)

// Toggle goal status
router.post('/goals/:id/toggle', studyPlannerController.toggleGoalStatus)

// ============================================
// STUDY BLOCKS (RECURRING)
// ============================================

// Create study block
router.post('/blocks', studyPlannerController.createStudyBlock)

// Get my study blocks
router.get('/blocks', studyPlannerController.getStudyBlocks)

// Update study block
router.put('/blocks/:id', studyPlannerController.updateStudyBlock)

// Delete study block
router.delete('/blocks/:id', studyPlannerController.deleteStudyBlock)

// ============================================
// SESSION TEMPLATES
// ============================================

// Create template
router.post('/templates', studyPlannerController.createTemplate)

// Get my templates
router.get('/templates', studyPlannerController.getTemplates)

// Create session from template
router.post('/templates/:id/use', studyPlannerController.useTemplate)

// Delete template
router.delete('/templates/:id', studyPlannerController.deleteTemplate)

// ============================================
// STATISTICS
// ============================================

// Get study statistics
router.get('/statistics', studyPlannerController.getStatistics)

// ============================================
// CALENDAR INTEGRATION
// ============================================

// Get calendar integration
router.get('/calendar/:provider', studyPlannerController.getCalendarIntegration)

// Setup calendar integration
router.post('/calendar/:provider', studyPlannerController.setupCalendarIntegration)

// Delete calendar integration
router.delete('/calendar/:provider', studyPlannerController.deleteCalendarIntegration)

export default router

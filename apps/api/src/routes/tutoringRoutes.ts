import { Router } from 'express'
import tutoringController from '../controllers/tutoringController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// ============================================
// PUBLIC ROUTES
// ============================================

// Search tutors (public)
router.get('/tutors/search', tutoringController.searchTutors)

// Get tutor profile by ID (public)
router.get('/tutors/:id', tutoringController.getTutorProfile)

// Get tutor reviews (public)
router.get('/tutors/:id/reviews', tutoringController.getTutorReviews)

// ============================================
// AUTHENTICATED ROUTES
// ============================================

router.use(authenticate)

// ============================================
// TUTOR PROFILE MANAGEMENT
// ============================================

// Apply to become a tutor
router.post('/tutors/apply', tutoringController.createTutorProfile)

// Get own tutor profile
router.get('/tutors/me/profile', tutoringController.getMyTutorProfile)

// Update own tutor profile
router.put('/tutors/me/profile', tutoringController.updateTutorProfile)

// Get tutor stats
router.get('/tutors/me/stats', tutoringController.getTutorStats)

// Get tutor sessions
router.get('/tutors/me/sessions', tutoringController.getTutorSessions)

// ============================================
// TUTORING REQUESTS (STUDENT)
// ============================================

// Create a tutoring request
router.post('/requests', tutoringController.createTutoringRequest)

// Get my tutoring requests
router.get('/requests/me', tutoringController.getMyTutoringRequests)

// Get open tutoring requests (for tutors)
router.get('/requests/open', tutoringController.getOpenTutoringRequests)

// Get single request
router.get('/requests/:id', tutoringController.getTutoringRequest)

// Update request status
router.put('/requests/:id/status', tutoringController.updateTutoringRequestStatus)

// Get matching tutors for a request
router.get('/requests/:id/matches', tutoringController.getMatchingTutors)

// Get applications for my request
router.get('/requests/:id/applications', tutoringController.getRequestApplications)

// ============================================
// TUTOR APPLICATIONS
// ============================================

// Apply to a tutoring request
router.post('/requests/:id/apply', tutoringController.applyToRequest)

// Accept an application
router.post('/applications/:id/accept', tutoringController.acceptApplication)

// ============================================
// TUTORING SESSIONS
// ============================================

// Create a session
router.post('/sessions', tutoringController.createSession)

// Get my sessions (as student)
router.get('/sessions/me', tutoringController.getMySessions)

// Get single session
router.get('/sessions/:id', tutoringController.getSession)

// Update session status
router.put('/sessions/:id/status', tutoringController.updateSessionStatus)

// Send message in session
router.post('/sessions/:id/messages', tutoringController.sendSessionMessage)

// Get session messages
router.get('/sessions/:id/messages', tutoringController.getSessionMessages)

// ============================================
// REVIEWS
// ============================================

// Create a review
router.post('/sessions/:id/review', tutoringController.createReview)

// Respond to review (tutor)
router.post('/reviews/:id/respond', tutoringController.respondToReview)

// ============================================
// ADMIN ROUTES
// ============================================

// Get pending tutor applications
router.get('/admin/applications', authorize('ADMIN', 'SUPER_ADMIN'), tutoringController.getPendingApplications)

// Approve/reject tutor
router.put('/admin/tutors/:id/status', authorize('ADMIN', 'SUPER_ADMIN'), tutoringController.updateTutorStatus)

// Get platform stats
router.get('/admin/stats', authorize('ADMIN', 'SUPER_ADMIN'), tutoringController.getPlatformStats)

export default router

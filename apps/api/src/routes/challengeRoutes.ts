import { Router } from 'express'
import challengeController from '../controllers/challengeController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// ============================================
// PUBLIC ROUTES
// ============================================

// Get active challenges
router.get('/active', challengeController.getActiveChallenges)

// Get upcoming challenges
router.get('/upcoming', challengeController.getUpcomingChallenges)

// Get challenges by type
router.get('/type/:type', challengeController.getChallengesByType)

// Get challenge details
router.get('/:id', challengeController.getChallenge)

// Get challenge leaderboard
router.get('/:id/leaderboard', challengeController.getChallengeLeaderboard)

// ============================================
// AUTHENTICATED ROUTES
// ============================================

router.use(authenticate)

// ============================================
// USER CHALLENGE PARTICIPATION
// ============================================

// Join a challenge
router.post('/:id/join', challengeController.joinChallenge)

// Leave a challenge
router.post('/:id/leave', challengeController.leaveChallenge)

// Get my challenges
router.get('/me/participations', challengeController.getMyChallenges)

// Claim rewards
router.post('/:id/claim-rewards', challengeController.claimRewards)

// Get my challenge stats
router.get('/me/stats', challengeController.getMyChallengeStats)

// ============================================
// TEAM ROUTES
// ============================================

// Create team
router.post('/teams', challengeController.createTeam)

// Get my teams
router.get('/teams/me', challengeController.getMyTeams)

// Get team details
router.get('/teams/:id', challengeController.getTeam)

// Join team
router.post('/teams/:id/join', challengeController.joinTeam)

// Leave team
router.post('/teams/:id/leave', challengeController.leaveTeam)

// ============================================
// TEAM COMPETITIONS
// ============================================

// Get active team competitions
router.get('/competitions', challengeController.getActiveTeamCompetitions)

// Get competition leaderboard
router.get('/competitions/:id/leaderboard', challengeController.getTeamCompetitionLeaderboard)

// Register team for competition
router.post('/competitions/:id/register/:teamId', challengeController.registerTeamForCompetition)

// ============================================
// ADMIN ROUTES
// ============================================

// Create challenge
router.post('/', authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), challengeController.createChallenge)

// Update challenge
router.put('/:id', authorize('ADMIN', 'SUPER_ADMIN'), challengeController.updateChallenge)

// Publish challenge
router.post('/:id/publish', authorize('ADMIN', 'SUPER_ADMIN'), challengeController.publishChallenge)

// Create team competition
router.post('/competitions', authorize('ADMIN', 'SUPER_ADMIN'), challengeController.createTeamCompetition)

// Get platform challenge stats
router.get('/admin/stats', authorize('ADMIN', 'SUPER_ADMIN'), challengeController.getChallengeStats)

export default router

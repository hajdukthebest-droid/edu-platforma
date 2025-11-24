import { Router } from 'express'
import socialController from '../controllers/socialController'
import { authenticate } from '../middleware/auth'

const router = Router()

// ============================================
// PUBLIC ROUTES
// ============================================

// Get discover feed (public activities)
router.get('/feed/discover', socialController.getDiscoverFeed)

// Get user's public profile
router.get('/users/:userId/profile', socialController.getUserProfile)

// Get user's public activities
router.get('/users/:userId/activities', socialController.getUserActivities)

// Get user's followers
router.get('/users/:userId/followers', socialController.getUserFollowers)

// Get user's following
router.get('/users/:userId/following', socialController.getUserFollowing)

// ============================================
// AUTHENTICATED ROUTES
// ============================================

router.use(authenticate)

// ============================================
// FEED
// ============================================

// Get my feed (from followed users)
router.get('/feed', socialController.getMyFeed)

// Get single activity
router.get('/activities/:id', socialController.getActivity)

// ============================================
// ACTIVITIES
// ============================================

// Get my activities
router.get('/me/activities', socialController.getMyActivities)

// ============================================
// LIKES & COMMENTS
// ============================================

// Like an activity
router.post('/activities/:id/like', socialController.likeActivity)

// Unlike an activity
router.delete('/activities/:id/like', socialController.unlikeActivity)

// Comment on activity
router.post('/activities/:id/comments', socialController.commentOnActivity)

// Delete comment
router.delete('/comments/:id', socialController.deleteComment)

// ============================================
// FOLLOWING
// ============================================

// Follow a user
router.post('/users/:userId/follow', socialController.followUser)

// Unfollow a user
router.delete('/users/:userId/follow', socialController.unfollowUser)

// Check if following
router.get('/users/:userId/is-following', socialController.checkIsFollowing)

// Get my followers
router.get('/me/followers', socialController.getMyFollowers)

// Get who I'm following
router.get('/me/following', socialController.getMyFollowing)

// ============================================
// PROFILE
// ============================================

// Get my social profile
router.get('/me/profile', socialController.getMySocialProfile)

// Update my social profile
router.put('/me/profile', socialController.updateMySocialProfile)

// Update privacy settings
router.put('/me/privacy', socialController.updatePrivacySettings)

// ============================================
// SUGGESTIONS
// ============================================

// Get suggested users to follow
router.get('/suggestions/users', socialController.getSuggestedUsers)

export default router

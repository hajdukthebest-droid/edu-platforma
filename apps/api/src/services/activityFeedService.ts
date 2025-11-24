import { PrismaClient, ActivityType } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// INTERFACES
// ============================================

interface CreateActivityData {
  userId: string
  type: ActivityType
  title: string
  description?: string
  courseId?: string
  lessonId?: string
  badgeId?: string
  challengeId?: string
  achievementId?: string
  metadata?: Record<string, unknown>
  isPublic?: boolean
}

interface UpdatePrivacySettings {
  showActivity?: boolean
  showProgress?: boolean
  showBadges?: boolean
  allowFollow?: boolean
}

// ============================================
// ACTIVITY FEED SERVICE
// ============================================

class ActivityFeedService {
  // ============================================
  // ACTIVITIES
  // ============================================

  /**
   * Create a new activity
   */
  async createActivity(data: CreateActivityData) {
    const activity = await prisma.activity.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        courseId: data.courseId,
        lessonId: data.lessonId,
        badgeId: data.badgeId,
        challengeId: data.challengeId,
        achievementId: data.achievementId,
        metadata: data.metadata ?? null,
        isPublic: data.isPublic ?? true,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })

    // Update user's activity count
    await prisma.userProfile.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        activitiesCount: 1,
      },
      update: {
        activitiesCount: { increment: 1 },
      },
    })

    return activity
  }

  /**
   * Get user's own activity feed
   */
  async getUserActivities(userId: string, page = 1, limit = 20) {
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { userId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where: { userId } }),
    ])

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get feed from followed users
   */
  async getFollowingFeed(userId: string, page = 1, limit = 20) {
    // Get list of users being followed
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })

    const followingIds = following.map(f => f.followingId)

    // Include own activities in feed
    followingIds.push(userId)

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: {
          userId: { in: followingIds },
          isPublic: true,
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({
        where: {
          userId: { in: followingIds },
          isPublic: true,
        },
      }),
    ])

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get global/discover feed (public activities)
   */
  async getDiscoverFeed(page = 1, limit = 20) {
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { isPublic: true },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where: { isPublic: true } }),
    ])

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get single activity with details
   */
  async getActivity(activityId: string, userId?: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        likes: userId ? {
          where: { userId },
          select: { id: true },
        } : false,
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
            replies: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, avatar: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    })

    return activity
  }

  /**
   * Like an activity
   */
  async likeActivity(activityId: string, userId: string) {
    const existing = await prisma.activityLike.findUnique({
      where: {
        activityId_userId: { activityId, userId },
      },
    })

    if (existing) {
      throw new Error('Already liked')
    }

    await prisma.activityLike.create({
      data: { activityId, userId },
    })

    await prisma.activity.update({
      where: { id: activityId },
      data: { likesCount: { increment: 1 } },
    })

    return { success: true }
  }

  /**
   * Unlike an activity
   */
  async unlikeActivity(activityId: string, userId: string) {
    const existing = await prisma.activityLike.findUnique({
      where: {
        activityId_userId: { activityId, userId },
      },
    })

    if (!existing) {
      throw new Error('Not liked')
    }

    await prisma.activityLike.delete({
      where: { id: existing.id },
    })

    await prisma.activity.update({
      where: { id: activityId },
      data: { likesCount: { decrement: 1 } },
    })

    return { success: true }
  }

  /**
   * Comment on an activity
   */
  async commentOnActivity(activityId: string, userId: string, content: string, parentId?: string) {
    const comment = await prisma.activityComment.create({
      data: {
        activityId,
        userId,
        content,
        parentId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })

    await prisma.activity.update({
      where: { id: activityId },
      data: { commentsCount: { increment: 1 } },
    })

    return comment
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.activityComment.findUnique({
      where: { id: commentId },
    })

    if (!comment || comment.userId !== userId) {
      throw new Error('Not authorized')
    }

    await prisma.activityComment.delete({
      where: { id: commentId },
    })

    await prisma.activity.update({
      where: { id: comment.activityId },
      data: { commentsCount: { decrement: 1 } },
    })

    return { success: true }
  }

  // ============================================
  // FOLLOWING SYSTEM
  // ============================================

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself')
    }

    // Check if target user allows following
    const targetProfile = await prisma.userProfile.findUnique({
      where: { userId: followingId },
    })

    if (targetProfile && !targetProfile.allowFollow) {
      throw new Error('User does not allow followers')
    }

    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    })

    if (existing) {
      throw new Error('Already following')
    }

    await prisma.userFollow.create({
      data: { followerId, followingId },
    })

    // Update counts
    await Promise.all([
      prisma.userProfile.upsert({
        where: { userId: followerId },
        create: { userId: followerId, followingCount: 1 },
        update: { followingCount: { increment: 1 } },
      }),
      prisma.userProfile.upsert({
        where: { userId: followingId },
        create: { userId: followingId, followersCount: 1 },
        update: { followersCount: { increment: 1 } },
      }),
    ])

    return { success: true }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string) {
    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    })

    if (!existing) {
      throw new Error('Not following')
    }

    await prisma.userFollow.delete({
      where: { id: existing.id },
    })

    // Update counts
    await Promise.all([
      prisma.userProfile.update({
        where: { userId: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
      prisma.userProfile.update({
        where: { userId: followingId },
        data: { followersCount: { decrement: 1 } },
      }),
    ])

    return { success: true }
  }

  /**
   * Get followers of a user
   */
  async getFollowers(userId: string, page = 1, limit = 20) {
    const [followers, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: { id: true, firstName: true, lastName: true, avatar: true, bio: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.userFollow.count({ where: { followingId: userId } }),
    ])

    return {
      followers: followers.map(f => f.follower),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(userId: string, page = 1, limit = 20) {
    const [following, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: { id: true, firstName: true, lastName: true, avatar: true, bio: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.userFollow.count({ where: { followerId: userId } }),
    ])

    return {
      following: following.map(f => f.following),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string) {
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    })

    return !!follow
  }

  // ============================================
  // USER PROFILE
  // ============================================

  /**
   * Get user's social profile
   */
  async getSocialProfile(userId: string, viewerId?: string) {
    const [profile, user, isFollowing] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
          level: true,
          totalPoints: true,
          currentStreak: true,
          longestStreak: true,
        },
      }),
      viewerId && viewerId !== userId
        ? this.isFollowing(viewerId, userId)
        : Promise.resolve(false),
    ])

    return {
      user,
      profile: profile ?? {
        followersCount: 0,
        followingCount: 0,
        activitiesCount: 0,
        showActivity: true,
        showProgress: true,
        showBadges: true,
        allowFollow: true,
      },
      isFollowing,
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(userId: string, settings: UpdatePrivacySettings) {
    return prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...settings,
      },
      update: settings,
    })
  }

  /**
   * Update social profile
   */
  async updateSocialProfile(userId: string, data: { coverImage?: string; socialLinks?: Record<string, string>; interests?: string[] }) {
    return prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        coverImage: data.coverImage,
        socialLinks: data.socialLinks ?? null,
        interests: data.interests ?? [],
      },
      update: {
        coverImage: data.coverImage,
        socialLinks: data.socialLinks ?? undefined,
        interests: data.interests,
      },
    })
  }

  // ============================================
  // SUGGESTED USERS
  // ============================================

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(userId: string, limit = 10) {
    // Get users with most followers that the current user is not following
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })

    const followingIds = following.map(f => f.followingId)
    followingIds.push(userId) // Exclude self

    const suggestedUsers = await prisma.userProfile.findMany({
      where: {
        userId: { notIn: followingIds },
        allowFollow: true,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true, bio: true, level: true },
        },
      },
      orderBy: { followersCount: 'desc' },
      take: limit,
    })

    return suggestedUsers.map(s => ({
      ...s.user,
      followersCount: s.followersCount,
    }))
  }

  // ============================================
  // ACTIVITY TRACKING HELPERS
  // ============================================

  /**
   * Track course enrollment
   */
  async trackCourseEnrollment(userId: string, courseId: string, courseTitle: string) {
    return this.createActivity({
      userId,
      type: 'COURSE_ENROLLED',
      title: `Upisan u tečaj: ${courseTitle}`,
      courseId,
    })
  }

  /**
   * Track course completion
   */
  async trackCourseCompletion(userId: string, courseId: string, courseTitle: string) {
    return this.createActivity({
      userId,
      type: 'COURSE_COMPLETED',
      title: `Završio tečaj: ${courseTitle}`,
      courseId,
    })
  }

  /**
   * Track badge earned
   */
  async trackBadgeEarned(userId: string, badgeId: string, badgeName: string) {
    return this.createActivity({
      userId,
      type: 'BADGE_EARNED',
      title: `Osvojena značka: ${badgeName}`,
      badgeId,
    })
  }

  /**
   * Track level up
   */
  async trackLevelUp(userId: string, newLevel: number) {
    return this.createActivity({
      userId,
      type: 'LEVEL_UP',
      title: `Napredovao na razinu ${newLevel}!`,
      metadata: { level: newLevel },
    })
  }

  /**
   * Track challenge completion
   */
  async trackChallengeCompletion(userId: string, challengeId: string, challengeTitle: string) {
    return this.createActivity({
      userId,
      type: 'CHALLENGE_COMPLETED',
      title: `Završio izazov: ${challengeTitle}`,
      challengeId,
    })
  }

  /**
   * Track streak milestone
   */
  async trackStreakMilestone(userId: string, days: number) {
    return this.createActivity({
      userId,
      type: 'STREAK_MILESTONE',
      title: `Dostigao ${days}-dnevni streak!`,
      metadata: { streakDays: days },
    })
  }
}

export const activityFeedService = new ActivityFeedService()
export default activityFeedService

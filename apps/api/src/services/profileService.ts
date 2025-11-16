import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'

export class ProfileService {
  async getPublicProfile(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        profession: true,
        organization: true,
        totalPoints: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            forumPosts: true,
            forumComments: true,
          },
        },
      },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    // Get achievements
    const achievements = await prisma.userAchievement.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
      },
      include: {
        achievement: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            points: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10,
    })

    // Get badges
    const badges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            type: true,
            pointsValue: true,
          },
        },
      },
      orderBy: {
        earnedAt: 'desc',
      },
      take: 10,
    })

    // Get completed courses with certificates
    const completedCourses = await prisma.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            category: true,
            level: true,
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
      take: 6,
    })

    // Get recent forum activity
    const recentForumPosts = await prisma.forumPost.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        upvotes: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    return {
      user: {
        ...user,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      },
      achievements,
      badges,
      completedCourses,
      recentForumPosts,
      stats: {
        totalEnrollments: user._count.enrollments,
        totalCertificates: user._count.certificates,
        totalForumPosts: user._count.forumPosts,
        totalForumComments: user._count.forumComments,
        totalAchievements: achievements.length,
        totalBadges: badges.length,
      },
    }
  }

  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
      },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    // Get enrollment stats
    const [totalEnrollments, completedCourses, inProgressCourses] = await Promise.all([
      prisma.enrollment.count({
        where: { userId },
      }),
      prisma.courseProgress.count({
        where: {
          userId,
          isCompleted: true,
        },
      }),
      prisma.courseProgress.count({
        where: {
          userId,
          isCompleted: false,
        },
      }),
    ])

    // Get certificates
    const certificates = await prisma.certificate.count({
      where: { userId },
    })

    // Get learning time (sum of all lesson durations from completed lessons)
    const completedLessons = await prisma.lessonProgress.findMany({
      where: {
        userId,
        isCompleted: true,
      },
      include: {
        lesson: {
          select: {
            duration: true,
          },
        },
      },
    })

    const totalLearningMinutes = completedLessons.reduce(
      (sum, lp) => sum + (lp.lesson.duration || 0),
      0
    )

    // Get achievements and badges
    const [achievements, badges] = await Promise.all([
      prisma.userAchievement.findMany({
        where: {
          userId,
          isCompleted: true,
        },
        include: {
          achievement: true,
        },
        orderBy: {
          completedAt: 'desc',
        },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: true,
        },
        orderBy: {
          earnedAt: 'desc',
        },
      }),
    ])

    return {
      stats: {
        ...user,
        totalEnrollments,
        completedCourses,
        inProgressCourses,
        certificates,
        totalLearningMinutes,
        totalLearningHours: Math.round(totalLearningMinutes / 60),
      },
      achievements,
      badges,
    }
  }

  async updateProfile(userId: string, data: {
    firstName?: string
    lastName?: string
    bio?: string
    profession?: string
    organization?: string
    department?: string
    jobTitle?: string
    phone?: string
    avatar?: string
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        profession: true,
        organization: true,
        department: true,
        jobTitle: true,
        phone: true,
      },
    })

    return user
  }
}

export const profileService = new ProfileService()

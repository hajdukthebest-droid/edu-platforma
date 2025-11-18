import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { AssignmentType, AssignmentStatus, SubmissionStatus, Prisma } from '@prisma/client'
import { notificationService } from './notificationService'

// Types
interface CreateAssignmentData {
  courseId: string
  lessonId?: string
  title: string
  description: string
  instructions?: string
  type?: AssignmentType
  dueDate?: Date
  reviewDueDate?: Date
  maxPoints?: number
  minWordCount?: number
  maxWordCount?: number
  allowedFileTypes?: string[]
  maxFileSize?: number
  peerReviewEnabled?: boolean
  reviewsRequired?: number
  reviewsPerStudent?: number
  anonymousReviews?: boolean
  criteria?: Array<{
    name: string
    description?: string
    maxScore?: number
    weight?: number
  }>
}

interface UpdateAssignmentData {
  title?: string
  description?: string
  instructions?: string
  type?: AssignmentType
  status?: AssignmentStatus
  dueDate?: Date
  reviewDueDate?: Date
  maxPoints?: number
  peerReviewEnabled?: boolean
  reviewsRequired?: number
  reviewsPerStudent?: number
  anonymousReviews?: boolean
}

interface SubmitAssignmentData {
  content?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  selfAssessment?: string
}

interface SubmitReviewData {
  overallFeedback?: string
  strengthsNote?: string
  improvementsNote?: string
  criteriaScores: Array<{
    criteriaId: string
    score: number
    feedback?: string
  }>
}

export class PeerReviewService {
  // ========================
  // ASSIGNMENT MANAGEMENT
  // ========================

  async createAssignment(instructorId: string, data: CreateAssignmentData) {
    const assignment = await prisma.assignment.create({
      data: {
        courseId: data.courseId,
        lessonId: data.lessonId,
        instructorId,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        type: data.type || 'PROJECT',
        dueDate: data.dueDate,
        reviewDueDate: data.reviewDueDate,
        maxPoints: data.maxPoints || 100,
        minWordCount: data.minWordCount,
        maxWordCount: data.maxWordCount,
        allowedFileTypes: data.allowedFileTypes || ['pdf', 'doc', 'docx'],
        maxFileSize: data.maxFileSize || 10,
        peerReviewEnabled: data.peerReviewEnabled ?? true,
        reviewsRequired: data.reviewsRequired || 3,
        reviewsPerStudent: data.reviewsPerStudent || 3,
        anonymousReviews: data.anonymousReviews ?? true,
        criteria: {
          create: data.criteria?.map((c, index) => ({
            name: c.name,
            description: c.description,
            maxScore: c.maxScore || 10,
            weight: c.weight || 1.0,
            orderIndex: index,
          })) || [
            { name: 'Kvaliteta sadržaja', maxScore: 10, weight: 1.0, orderIndex: 0 },
            { name: 'Jasnoća izražavanja', maxScore: 10, weight: 1.0, orderIndex: 1 },
            { name: 'Originalnost', maxScore: 10, weight: 1.0, orderIndex: 2 },
          ],
        },
      },
      include: {
        criteria: { orderBy: { orderIndex: 'asc' } },
        course: { select: { id: true, title: true } },
        instructor: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return assignment
  }

  async getAssignments(filters: {
    courseId?: string
    instructorId?: string
    status?: AssignmentStatus
    page?: number
    limit?: number
  }) {
    const { courseId, instructorId, status, page = 1, limit = 20 } = filters

    const where: Prisma.AssignmentWhereInput = {}
    if (courseId) where.courseId = courseId
    if (instructorId) where.instructorId = instructorId
    if (status) where.status = status

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          course: { select: { id: true, title: true, slug: true } },
          instructor: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { submissions: true, criteria: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.assignment.count({ where }),
    ])

    return {
      assignments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getAssignmentById(id: string, userId?: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        lesson: { select: { id: true, title: true } },
        instructor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        criteria: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { submissions: true } },
      },
    })

    if (!assignment) {
      throw new AppError(404, 'Assignment not found')
    }

    // Get user's submission if userId provided
    let userSubmission = null
    if (userId) {
      userSubmission = await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId: id,
            studentId: userId,
          },
        },
        include: {
          receivedReviews: {
            where: { isCompleted: true },
            include: {
              criteriaScores: true,
              reviewer: assignment.anonymousReviews
                ? undefined
                : { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      })
    }

    return { ...assignment, userSubmission }
  }

  async updateAssignment(id: string, instructorId: string, data: UpdateAssignmentData) {
    const assignment = await prisma.assignment.findUnique({ where: { id } })

    if (!assignment) {
      throw new AppError(404, 'Assignment not found')
    }

    if (assignment.instructorId !== instructorId) {
      throw new AppError(403, 'Not authorized to update this assignment')
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data,
      include: {
        criteria: { orderBy: { orderIndex: 'asc' } },
        course: { select: { id: true, title: true } },
      },
    })

    return updated
  }

  async publishAssignment(id: string, instructorId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            enrollments: { select: { userId: true } },
          },
        },
      },
    })

    if (!assignment) {
      throw new AppError(404, 'Assignment not found')
    }

    if (assignment.instructorId !== instructorId) {
      throw new AppError(403, 'Not authorized')
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    })

    // Notify enrolled students
    for (const enrollment of assignment.course.enrollments) {
      await notificationService.create({
        userId: enrollment.userId,
        type: 'SYSTEM',
        title: 'Novi zadatak',
        message: `Objavljen je novi zadatak: ${assignment.title}`,
        link: `/assignments/${id}`,
      })
    }

    return updated
  }

  // ========================
  // SUBMISSION MANAGEMENT
  // ========================

  async submitAssignment(assignmentId: string, studentId: string, data: SubmitAssignmentData) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    })

    if (!assignment) {
      throw new AppError(404, 'Assignment not found')
    }

    if (assignment.status !== 'PUBLISHED') {
      throw new AppError(400, 'Assignment is not open for submissions')
    }

    if (assignment.dueDate && new Date() > assignment.dueDate) {
      throw new AppError(400, 'Assignment deadline has passed')
    }

    // Check word count if text content
    if (data.content && assignment.minWordCount) {
      const wordCount = data.content.split(/\s+/).length
      if (wordCount < assignment.minWordCount) {
        throw new AppError(400, `Minimum word count is ${assignment.minWordCount}`)
      }
      if (assignment.maxWordCount && wordCount > assignment.maxWordCount) {
        throw new AppError(400, `Maximum word count is ${assignment.maxWordCount}`)
      }
    }

    // Upsert submission
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      create: {
        assignmentId,
        studentId,
        content: data.content,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        selfAssessment: data.selfAssessment,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      update: {
        content: data.content,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        selfAssessment: data.selfAssessment,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      include: {
        assignment: { select: { title: true } },
      },
    })

    // Try to assign peer reviews
    await this.assignPeerReviews(assignmentId)

    return submission
  }

  async getSubmission(submissionId: string, userId: string) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            criteria: { orderBy: { orderIndex: 'asc' } },
          },
        },
        student: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        receivedReviews: {
          where: { isCompleted: true },
          include: {
            criteriaScores: true,
          },
        },
      },
    })

    if (!submission) {
      throw new AppError(404, 'Submission not found')
    }

    // Only allow student or instructor to view
    if (
      submission.studentId !== userId &&
      submission.assignment.instructorId !== userId
    ) {
      throw new AppError(403, 'Not authorized to view this submission')
    }

    return submission
  }

  async getMySubmissions(userId: string) {
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: userId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            maxPoints: true,
            course: { select: { title: true, slug: true } },
          },
        },
        _count: {
          select: { receivedReviews: { where: { isCompleted: true } } },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return submissions
  }

  // ========================
  // PEER REVIEW MANAGEMENT
  // ========================

  async assignPeerReviews(assignmentId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        submissions: {
          where: { status: 'SUBMITTED' },
          select: { id: true, studentId: true },
        },
      },
    })

    if (!assignment || !assignment.peerReviewEnabled) return

    const submissions = assignment.submissions

    // Need at least 2 submissions for peer review
    if (submissions.length < 2) return

    // Assign reviews
    for (const submission of submissions) {
      // Check how many reviews this submission has
      const existingReviews = await prisma.peerReview.count({
        where: { submissionId: submission.id },
      })

      const neededReviews = assignment.reviewsRequired - existingReviews
      if (neededReviews <= 0) continue

      // Find students who can review this submission
      const potentialReviewers = submissions
        .filter((s) => s.studentId !== submission.studentId)
        .map((s) => s.studentId)

      // Check who hasn't reviewed this yet and hasn't hit their review limit
      for (const reviewerId of potentialReviewers) {
        // Check if already reviewing
        const alreadyReviewing = await prisma.peerReview.findUnique({
          where: {
            submissionId_reviewerId: {
              submissionId: submission.id,
              reviewerId,
            },
          },
        })

        if (alreadyReviewing) continue

        // Check if reviewer has capacity
        const reviewerReviewCount = await prisma.peerReview.count({
          where: {
            reviewerId,
            submission: { assignmentId },
          },
        })

        if (reviewerReviewCount >= assignment.reviewsPerStudent) continue

        // Assign the review
        await prisma.peerReview.create({
          data: {
            submissionId: submission.id,
            reviewerId,
          },
        })

        // Update submission status
        await prisma.assignmentSubmission.update({
          where: { id: submission.id },
          data: { status: 'IN_REVIEW' },
        })

        // Notify reviewer
        await notificationService.create({
          userId: reviewerId,
          type: 'SYSTEM',
          title: 'Nova recenzija dodijeljena',
          message: `Imate novu recenziju za zadatak: ${assignment.title}`,
          link: `/assignments/${assignmentId}/review`,
        })

        const currentReviewCount = existingReviews + 1
        if (currentReviewCount >= assignment.reviewsRequired) break
      }
    }
  }

  async getMyPendingReviews(userId: string) {
    const reviews = await prisma.peerReview.findMany({
      where: {
        reviewerId: userId,
        isCompleted: false,
      },
      include: {
        submission: {
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                reviewDueDate: true,
                anonymousReviews: true,
                criteria: { orderBy: { orderIndex: 'asc' } },
                course: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return reviews
  }

  async getReviewToComplete(reviewId: string, userId: string) {
    const review = await prisma.peerReview.findUnique({
      where: { id: reviewId },
      include: {
        submission: {
          include: {
            assignment: {
              include: {
                criteria: { orderBy: { orderIndex: 'asc' } },
              },
            },
            student: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        criteriaScores: true,
      },
    })

    if (!review) {
      throw new AppError(404, 'Review not found')
    }

    if (review.reviewerId !== userId) {
      throw new AppError(403, 'Not authorized to complete this review')
    }

    // Hide student info if anonymous
    if (review.submission.assignment.anonymousReviews) {
      review.submission.student = { id: '', firstName: 'Anonim', lastName: '' } as any
    }

    return review
  }

  async submitReview(reviewId: string, userId: string, data: SubmitReviewData) {
    const review = await prisma.peerReview.findUnique({
      where: { id: reviewId },
      include: {
        submission: {
          include: {
            assignment: {
              include: { criteria: true },
            },
          },
        },
      },
    })

    if (!review) {
      throw new AppError(404, 'Review not found')
    }

    if (review.reviewerId !== userId) {
      throw new AppError(403, 'Not authorized')
    }

    if (review.isCompleted) {
      throw new AppError(400, 'Review already completed')
    }

    // Validate criteria scores
    const criteriaIds = review.submission.assignment.criteria.map((c) => c.id)
    for (const score of data.criteriaScores) {
      if (!criteriaIds.includes(score.criteriaId)) {
        throw new AppError(400, 'Invalid criteria ID')
      }

      const criteria = review.submission.assignment.criteria.find(
        (c) => c.id === score.criteriaId
      )
      if (criteria && (score.score < 0 || score.score > criteria.maxScore)) {
        throw new AppError(400, `Score must be between 0 and ${criteria.maxScore}`)
      }
    }

    // Calculate total score
    let totalWeightedScore = 0
    let totalWeight = 0

    for (const scoreData of data.criteriaScores) {
      const criteria = review.submission.assignment.criteria.find(
        (c) => c.id === scoreData.criteriaId
      )
      if (criteria) {
        const normalizedScore = (scoreData.score / criteria.maxScore) * 100
        totalWeightedScore += normalizedScore * criteria.weight
        totalWeight += criteria.weight
      }
    }

    const totalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0

    // Update review
    const updatedReview = await prisma.peerReview.update({
      where: { id: reviewId },
      data: {
        overallFeedback: data.overallFeedback,
        strengthsNote: data.strengthsNote,
        improvementsNote: data.improvementsNote,
        totalScore,
        isCompleted: true,
        completedAt: new Date(),
        criteriaScores: {
          deleteMany: {},
          create: data.criteriaScores.map((s) => ({
            criteriaId: s.criteriaId,
            score: s.score,
            feedback: s.feedback,
          })),
        },
      },
    })

    // Update submission peer score
    await this.updateSubmissionPeerScore(review.submissionId)

    // Notify submission author
    await notificationService.create({
      userId: review.submission.studentId,
      type: 'SYSTEM',
      title: 'Nova recenzija primljena',
      message: `Primili ste novu recenziju za vaš rad`,
      link: `/submissions/${review.submissionId}`,
    })

    return updatedReview
  }

  async updateSubmissionPeerScore(submissionId: string) {
    const reviews = await prisma.peerReview.findMany({
      where: {
        submissionId,
        isCompleted: true,
      },
      select: { totalScore: true },
    })

    if (reviews.length === 0) return

    const avgScore =
      reviews.reduce((sum, r) => sum + (r.totalScore || 0), 0) / reviews.length

    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        peerScore: avgScore,
        status: 'REVIEWED',
      },
      include: {
        assignment: true,
      },
    })

    // Calculate final score (peer + instructor if available)
    if (submission.instructorScore) {
      const finalScore = (submission.peerScore! * 0.3 + submission.instructorScore * 0.7)
      await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: { finalScore },
      })
    }
  }

  async rateReviewHelpfulness(reviewId: string, userId: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new AppError(400, 'Rating must be between 1 and 5')
    }

    const review = await prisma.peerReview.findUnique({
      where: { id: reviewId },
      include: { submission: true },
    })

    if (!review) {
      throw new AppError(404, 'Review not found')
    }

    // Only submission author can rate
    if (review.submission.studentId !== userId) {
      throw new AppError(403, 'Only submission author can rate reviews')
    }

    const updated = await prisma.peerReview.update({
      where: { id: reviewId },
      data: { helpfulnessRating: rating },
    })

    return updated
  }

  // ========================
  // INSTRUCTOR GRADING
  // ========================

  async gradeSubmission(
    submissionId: string,
    instructorId: string,
    data: { score: number; feedback?: string }
  ) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    })

    if (!submission) {
      throw new AppError(404, 'Submission not found')
    }

    if (submission.assignment.instructorId !== instructorId) {
      throw new AppError(403, 'Not authorized')
    }

    if (data.score < 0 || data.score > submission.assignment.maxPoints) {
      throw new AppError(400, `Score must be between 0 and ${submission.assignment.maxPoints}`)
    }

    // Calculate final score
    let finalScore = data.score
    if (submission.peerScore) {
      // Weight: 70% instructor, 30% peer
      finalScore = data.score * 0.7 + submission.peerScore * 0.3
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        instructorScore: data.score,
        instructorFeedback: data.feedback,
        finalScore,
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
    })

    // Notify student
    await notificationService.create({
      userId: submission.studentId,
      type: 'SYSTEM',
      title: 'Zadatak ocijenjen',
      message: `Vaš zadatak je ocijenjen. Rezultat: ${finalScore.toFixed(1)}/${submission.assignment.maxPoints}`,
      link: `/submissions/${submissionId}`,
    })

    return updated
  }

  async getAssignmentSubmissions(assignmentId: string, instructorId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    })

    if (!assignment) {
      throw new AppError(404, 'Assignment not found')
    }

    if (assignment.instructorId !== instructorId) {
      throw new AppError(403, 'Not authorized')
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { receivedReviews: { where: { isCompleted: true } } } },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return submissions
  }
}

export const peerReviewService = new PeerReviewService()

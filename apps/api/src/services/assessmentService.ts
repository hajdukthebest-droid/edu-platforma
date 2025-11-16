import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { AssessmentType, QuestionType, Prisma } from '@prisma/client'

interface CreateAssessmentData {
  courseId?: string
  lessonId?: string
  moduleId?: string
  title: string
  description?: string
  type: AssessmentType
  timeLimit?: number
  passingScore?: number
  maxAttempts?: number
  shuffleQuestions?: boolean
  shuffleAnswers?: boolean
  showResults?: boolean
  showCorrectAnswers?: boolean
  pointsReward?: number
  requiresManualGrading?: boolean
  isPublished?: boolean
  availableFrom?: Date
  availableUntil?: Date
  randomizeQuestions?: number
}

interface CreateQuestionData {
  type: QuestionType
  question: string
  explanation?: string
  points?: number
  options?: any[]
  correctAnswers?: any[]
}

interface SubmitAssessmentData {
  answers: Record<string, any>
}

export class AssessmentService {
  async createAssessment(data: CreateAssessmentData) {
    const assessment = await prisma.assessment.create({
      data,
      include: {
        questions: true,
      },
    })

    return assessment
  }

  async getAssessmentById(id: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!assessment) {
      throw new AppError(404, 'Assessment not found')
    }

    return assessment
  }

  async addQuestion(assessmentId: string, data: CreateQuestionData) {
    // Get current question count for orderIndex
    const count = await prisma.question.count({
      where: { assessmentId },
    })

    const question = await prisma.question.create({
      data: {
        assessmentId,
        ...data,
        orderIndex: count,
      },
    })

    return question
  }

  async updateQuestion(id: string, data: Partial<CreateQuestionData>) {
    const question = await prisma.question.update({
      where: { id },
      data,
    })

    return question
  }

  async deleteQuestion(id: string) {
    await prisma.question.delete({
      where: { id },
    })
  }

  async startAssessment(assessmentId: string, userId: string) {
    const assessment = await this.getAssessmentById(assessmentId)

    // Check max attempts
    if (assessment.maxAttempts) {
      const attemptCount = await prisma.assessmentAttempt.count({
        where: {
          assessmentId,
          userId,
        },
      })

      if (attemptCount >= assessment.maxAttempts) {
        throw new AppError(403, 'Maximum attempts reached')
      }
    }

    // Shuffle questions if needed
    let questions = assessment.questions
    if (assessment.shuffleQuestions) {
      questions = this.shuffleArray([...questions])
    }

    // Shuffle answers if needed
    if (assessment.shuffleAnswers) {
      questions = questions.map(q => {
        if (q.options && Array.isArray(q.options)) {
          return {
            ...q,
            options: this.shuffleArray([...q.options as any[]]),
          }
        }
        return q
      })
    }

    // Remove correct answers from response
    const questionsForUser = questions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      points: q.points,
      options: q.options,
      // Don't send correctAnswers and explanation yet
    }))

    return {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      timeLimit: assessment.timeLimit,
      questions: questionsForUser,
    }
  }

  async submitAssessment(
    assessmentId: string,
    userId: string,
    data: SubmitAssessmentData & { timeSpent?: number }
  ) {
    const assessment = await this.getAssessmentById(assessmentId)
    const { answers, timeSpent } = data

    // Check if contains essay questions requiring manual grading
    const hasEssayQuestions = assessment.questions.some(
      q => q.type === QuestionType.ESSAY
    )

    // Grade auto-gradable questions
    let earnedPoints = 0
    const totalPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0)
    const questionAttempts: any[] = []

    assessment.questions.forEach(question => {
      const userAnswer = answers[question.id]

      if (question.type === QuestionType.ESSAY) {
        // Essay questions need manual grading
        questionAttempts.push({
          questionId: question.id,
          answer: userAnswer,
          isCorrect: null,
          pointsEarned: 0,
        })
      } else {
        // Auto-gradable questions
        const isCorrect = this.checkAnswer(question, userAnswer)
        if (isCorrect) {
          earnedPoints += question.points
        }
        questionAttempts.push({
          questionId: question.id,
          answer: userAnswer,
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        })
      }
    })

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = hasEssayQuestions ? false : score >= assessment.passingScore

    // Determine grading status
    const gradingStatus = hasEssayQuestions ? 'PENDING' : 'GRADED'

    // Create attempt record
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        userId,
        answers,
        score,
        totalPoints,
        earnedPoints,
        passed,
        timeSpent,
        gradingStatus,
        completedAt: new Date(),
      },
    })

    // Create question attempts
    await Promise.all(
      questionAttempts.map(qa =>
        prisma.questionAttempt.create({
          data: {
            attemptId: attempt.id,
            questionId: qa.questionId,
            answer: qa.answer,
            isCorrect: qa.isCorrect,
            pointsEarned: qa.pointsEarned,
          },
        })
      )
    )

    // Award points if passed (only for auto-graded assessments)
    if (passed && !hasEssayQuestions) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            increment: assessment.pointsReward,
          },
        },
      })
    }

    // Return results
    const results: any = {
      attemptId: attempt.id,
      score,
      earnedPoints,
      totalPoints,
      passed,
    }

    // Include detailed feedback if enabled
    if (assessment.showResults) {
      results.questions = assessment.questions.map(question => {
        const userAnswer = answers[question.id]
        const isCorrect = this.checkAnswer(question, userAnswer)

        return {
          id: question.id,
          question: question.question,
          userAnswer,
          isCorrect,
          points: isCorrect ? question.points : 0,
          ...(assessment.showCorrectAnswers && {
            correctAnswers: question.correctAnswers,
            explanation: question.explanation,
          }),
        }
      })
    }

    return results
  }

  async getUserAttempts(assessmentId: string, userId: string) {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        userId,
      },
      orderBy: {
        startedAt: 'desc',
      },
    })

    return attempts
  }

  async getAttemptById(id: string, userId: string) {
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        assessment: {
          include: {
            questions: true,
          },
        },
      },
    })

    if (!attempt) {
      throw new AppError(404, 'Attempt not found')
    }

    return attempt
  }

  private checkAnswer(question: any, userAnswer: any): boolean {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        if (Array.isArray(question.correctAnswers)) {
          // Multiple correct answers
          if (!Array.isArray(userAnswer)) return false
          const correctSet = new Set(question.correctAnswers)
          const userSet = new Set(userAnswer)
          return (
            correctSet.size === userSet.size &&
            [...correctSet].every(x => userSet.has(x))
          )
        } else {
          // Single correct answer
          return userAnswer === question.correctAnswers
        }

      case QuestionType.TRUE_FALSE:
        return userAnswer === question.correctAnswers

      case QuestionType.SHORT_ANSWER:
        // Case-insensitive comparison
        const correctAnswers = Array.isArray(question.correctAnswers)
          ? question.correctAnswers
          : [question.correctAnswers]
        return correctAnswers.some(
          (correct: string) =>
            correct.toLowerCase().trim() === String(userAnswer).toLowerCase().trim()
        )

      case QuestionType.FILL_BLANK:
        // Check if all blanks are filled correctly
        if (!Array.isArray(question.correctAnswers) || !Array.isArray(userAnswer)) {
          return false
        }
        return question.correctAnswers.every(
          (correct: string, index: number) =>
            correct.toLowerCase().trim() ===
            String(userAnswer[index] || '').toLowerCase().trim()
        )

      default:
        return false
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // ============================================
  // NEW METHODS FOR ENHANCED QUIZ SYSTEM
  // ============================================

  async updateAssessment(id: string, data: Partial<CreateAssessmentData>) {
    const assessment = await prisma.assessment.update({
      where: { id },
      data,
      include: {
        questions: true,
      },
    })

    return assessment
  }

  async deleteAssessment(id: string) {
    await prisma.assessment.delete({
      where: { id },
    })
  }

  async getCourseAssessments(courseId: string) {
    const assessments = await prisma.assessment.findMany({
      where: { courseId },
      include: {
        questions: true,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return assessments
  }

  async getInstructorAssessments(instructorId: string) {
    // Get assessments from courses created by instructor
    const assessments = await prisma.assessment.findMany({
      where: {
        courseId: {
          in: await prisma.course
            .findMany({
              where: { creatorId: instructorId },
              select: { id: true },
            })
            .then(courses => courses.map(c => c.id)),
        },
      },
      include: {
        questions: true,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return assessments
  }

  async getAssessmentAttempts(assessmentId: string, page = 1, limit = 20) {
    const [attempts, total] = await Promise.all([
      prisma.assessmentAttempt.findMany({
        where: { assessmentId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          completedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.assessmentAttempt.count({
        where: { assessmentId },
      }),
    ])

    return {
      attempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async gradeAttempt(
    attemptId: string,
    instructorId: string,
    data: {
      earnedPoints?: number
      feedback?: string
      questionGrades?: Array<{
        questionId: string
        pointsEarned: number
        feedback?: string
      }>
    }
  ) {
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questions: true,
          },
        },
      },
    })

    if (!attempt) {
      throw new AppError(404, 'Attempt not found')
    }

    // Calculate final score
    let totalEarned = data.earnedPoints || attempt.earnedPoints
    if (data.questionGrades && data.questionGrades.length > 0) {
      totalEarned = data.questionGrades.reduce((sum, g) => sum + g.pointsEarned, 0)
    }

    const score = (totalEarned / attempt.totalPoints) * 100
    const passed = score >= attempt.assessment.passingScore

    // Update attempt
    const updated = await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        earnedPoints: totalEarned,
        score,
        passed,
        gradingStatus: 'GRADED',
        gradedBy: instructorId,
        gradedAt: new Date(),
        feedback: data.feedback,
      },
    })

    // Update question attempts if provided
    if (data.questionGrades) {
      for (const grade of data.questionGrades) {
        // Check if question attempt exists
        const questionAttempt = await prisma.questionAttempt.findFirst({
          where: {
            attemptId,
            questionId: grade.questionId,
          },
        })

        if (questionAttempt) {
          await prisma.questionAttempt.update({
            where: { id: questionAttempt.id },
            data: {
              pointsEarned: grade.pointsEarned,
              instructorFeedback: grade.feedback,
            },
          })
        } else {
          // Create if doesn't exist
          await prisma.questionAttempt.create({
            data: {
              attemptId,
              questionId: grade.questionId,
              answer: (attempt.answers as any)[grade.questionId] || {},
              pointsEarned: grade.pointsEarned,
              instructorFeedback: grade.feedback,
            },
          })
        }
      }
    }

    // Award points if newly passed
    if (passed && !attempt.passed) {
      await prisma.user.update({
        where: { id: attempt.userId },
        data: {
          totalPoints: {
            increment: attempt.assessment.pointsReward,
          },
        },
      })
    }

    return updated
  }

  async getAssessmentAnalytics(assessmentId: string) {
    const [assessment, attempts] = await Promise.all([
      prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          questions: true,
        },
      }),
      prisma.assessmentAttempt.findMany({
        where: { assessmentId },
      }),
    ])

    if (!assessment) {
      throw new AppError(404, 'Assessment not found')
    }

    const totalAttempts = attempts.length
    const completedAttempts = attempts.filter(a => a.completedAt).length
    const passedAttempts = attempts.filter(a => a.passed).length

    const averageScore =
      completedAttempts > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts
        : 0

    const averageTimeSpent =
      completedAttempts > 0
        ? attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / completedAttempts
        : 0

    return {
      totalAttempts,
      completedAttempts,
      passedAttempts,
      passRate: completedAttempts > 0 ? (passedAttempts / completedAttempts) * 100 : 0,
      averageScore,
      averageTimeSpent,
      questionCount: assessment.questions.length,
      totalPoints: assessment.questions.reduce((sum, q) => sum + q.points, 0),
    }
  }

  async getQuestionAnalytics(assessmentId: string) {
    const assessment = await this.getAssessmentById(assessmentId)
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { assessmentId },
    })

    const questionStats = assessment.questions.map(question => {
      let correctCount = 0
      let totalAnswered = 0

      attempts.forEach(attempt => {
        const answers = attempt.answers as any
        const userAnswer = answers[question.id]

        if (userAnswer !== undefined && userAnswer !== null) {
          totalAnswered++
          if (this.checkAnswer(question, userAnswer)) {
            correctCount++
          }
        }
      })

      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        points: question.points,
        totalAnswered,
        correctCount,
        correctRate: totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0,
      }
    })

    return questionStats
  }

  async reorderQuestions(assessmentId: string, questionIds: string[]) {
    // Update order index for each question
    await Promise.all(
      questionIds.map((questionId, index) =>
        prisma.question.update({
          where: { id: questionId },
          data: { orderIndex: index },
        })
      )
    )

    return this.getAssessmentById(assessmentId)
  }

  async duplicateAssessment(assessmentId: string, newTitle?: string) {
    const original = await this.getAssessmentById(assessmentId)

    // Create new assessment
    const duplicated = await prisma.assessment.create({
      data: {
        courseId: original.courseId,
        lessonId: original.lessonId,
        moduleId: original.moduleId,
        title: newTitle || `${original.title} (Copy)`,
        description: original.description,
        type: original.type,
        timeLimit: original.timeLimit,
        passingScore: original.passingScore,
        maxAttempts: original.maxAttempts,
        shuffleQuestions: original.shuffleQuestions,
        shuffleAnswers: original.shuffleAnswers,
        showResults: original.showResults,
        showCorrectAnswers: original.showCorrectAnswers,
        requiresManualGrading: original.requiresManualGrading,
        isPublished: false, // Always set to draft
        pointsReward: original.pointsReward,
      },
    })

    // Duplicate questions
    await Promise.all(
      original.questions.map(q =>
        prisma.question.create({
          data: {
            assessmentId: duplicated.id,
            type: q.type,
            question: q.question,
            explanation: q.explanation,
            points: q.points,
            orderIndex: q.orderIndex,
            options: q.options,
            correctAnswers: q.correctAnswers,
          },
        })
      )
    )

    return this.getAssessmentById(duplicated.id)
  }
}

export const assessmentService = new AssessmentService()

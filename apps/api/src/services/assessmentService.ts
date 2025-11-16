import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { AssessmentType, QuestionType, Prisma } from '@prisma/client'

interface CreateAssessmentData {
  courseId?: string
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
    data: SubmitAssessmentData
  ) {
    const assessment = await this.getAssessmentById(assessmentId)
    const { answers } = data

    // Grade the assessment
    let earnedPoints = 0
    const totalPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0)

    assessment.questions.forEach(question => {
      const userAnswer = answers[question.id]
      if (!userAnswer) return

      const isCorrect = this.checkAnswer(question, userAnswer)
      if (isCorrect) {
        earnedPoints += question.points
      }
    })

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = score >= assessment.passingScore

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
        completedAt: new Date(),
      },
    })

    // Award points if passed
    if (passed) {
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
}

export const assessmentService = new AssessmentService()

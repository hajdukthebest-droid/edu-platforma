import { PrismaClient, ReviewDifficulty } from '@prisma/client'

const prisma = new PrismaClient()

interface CreateDeckData {
  title: string
  description?: string
  courseId?: string
  lessonId?: string
  createdById: string
  isPublic?: boolean
  tags?: string[]
}

interface CreateFlashcardData {
  deckId: string
  front: string
  back: string
  hint?: string
  image?: string
}

interface ReviewFlashcardData {
  userId: string
  flashcardId: string
  difficulty: ReviewDifficulty
  timeSpent?: number
}

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm
 */
class SpacedRepetitionAlgorithm {
  /**
   * Calculate next review parameters based on difficulty
   */
  static calculateNext(
    difficulty: ReviewDifficulty,
    currentEaseFactor: number = 2.5,
    currentInterval: number = 0,
    currentRepetitions: number = 0
  ): {
    easeFactor: number
    interval: number
    repetitions: number
    nextReview: Date
  } {
    let easeFactor = currentEaseFactor
    let interval = currentInterval
    let repetitions = currentRepetitions

    // Quality values: AGAIN=0, HARD=3, GOOD=4, EASY=5
    const qualityMap = {
      AGAIN: 0,
      HARD: 3,
      GOOD: 4,
      EASY: 5,
    }

    const quality = qualityMap[difficulty]

    // Calculate new ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    // Ease factor must be at least 1.3
    if (easeFactor < 1.3) {
      easeFactor = 1.3
    }

    // Calculate interval based on quality
    if (quality < 3) {
      // Failed - restart
      repetitions = 0
      interval = 1 // Review tomorrow
    } else {
      // Passed
      repetitions += 1

      if (repetitions === 1) {
        interval = 1
      } else if (repetitions === 2) {
        interval = 6
      } else {
        interval = Math.round(currentInterval * easeFactor)
      }
    }

    // Calculate next review date
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    return {
      easeFactor: Math.round(easeFactor * 100) / 100, // Round to 2 decimals
      interval,
      repetitions,
      nextReview,
    }
  }
}

class FlashcardService {
  /**
   * Create a new flashcard deck
   */
  async createDeck(data: CreateDeckData) {
    const deck = await prisma.flashcardDeck.create({
      data: {
        title: data.title,
        description: data.description,
        courseId: data.courseId,
        lessonId: data.lessonId,
        createdById: data.createdById,
        isPublic: data.isPublic ?? false,
        tags: data.tags || [],
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            flashcards: true,
          },
        },
      },
    })

    return deck
  }

  /**
   * Get all decks (with optional filtering)
   */
  async getDecks(filters?: {
    courseId?: string
    lessonId?: string
    createdById?: string
    isPublic?: boolean
  }) {
    const decks = await prisma.flashcardDeck.findMany({
      where: filters,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            flashcards: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return decks
  }

  /**
   * Get a single deck by ID
   */
  async getDeckById(deckId: string, includeFlashcards: boolean = false) {
    const deck = await prisma.flashcardDeck.findUnique({
      where: { id: deckId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        flashcards: includeFlashcards
          ? {
              orderBy: {
                orderIndex: 'asc',
              },
            }
          : false,
        _count: {
          select: {
            flashcards: true,
          },
        },
      },
    })

    if (!deck) {
      throw new Error('Deck not found')
    }

    return deck
  }

  /**
   * Update a deck
   */
  async updateDeck(deckId: string, data: Partial<CreateDeckData>) {
    const deck = await prisma.flashcardDeck.update({
      where: { id: deckId },
      data: {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
        tags: data.tags,
      },
    })

    return deck
  }

  /**
   * Delete a deck
   */
  async deleteDeck(deckId: string) {
    await prisma.flashcardDeck.delete({
      where: { id: deckId },
    })

    return { success: true }
  }

  /**
   * Create a flashcard
   */
  async createFlashcard(data: CreateFlashcardData) {
    // Get the current max order index
    const lastCard = await prisma.flashcard.findFirst({
      where: { deckId: data.deckId },
      orderBy: { orderIndex: 'desc' },
    })

    const orderIndex = lastCard ? lastCard.orderIndex + 1 : 0

    const flashcard = await prisma.flashcard.create({
      data: {
        deckId: data.deckId,
        front: data.front,
        back: data.back,
        hint: data.hint,
        image: data.image,
        orderIndex,
      },
    })

    return flashcard
  }

  /**
   * Get flashcards for a deck
   */
  async getFlashcards(deckId: string) {
    const flashcards = await prisma.flashcard.findMany({
      where: { deckId },
      orderBy: { orderIndex: 'asc' },
    })

    return flashcards
  }

  /**
   * Update a flashcard
   */
  async updateFlashcard(
    flashcardId: string,
    data: Partial<Omit<CreateFlashcardData, 'deckId'>>
  ) {
    const flashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        front: data.front,
        back: data.back,
        hint: data.hint,
        image: data.image,
      },
    })

    return flashcard
  }

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(flashcardId: string) {
    await prisma.flashcard.delete({
      where: { id: flashcardId },
    })

    return { success: true }
  }

  /**
   * Reorder flashcards
   */
  async reorderFlashcards(deckId: string, flashcardIds: string[]) {
    // Update order index for each card
    const updates = flashcardIds.map((id, index) =>
      prisma.flashcard.update({
        where: { id },
        data: { orderIndex: index },
      })
    )

    await Promise.all(updates)

    return { success: true }
  }

  /**
   * Review a flashcard (submit difficulty rating)
   */
  async reviewFlashcard(data: ReviewFlashcardData) {
    // Get previous review to calculate next parameters
    const previousReview = await prisma.flashcardReview.findFirst({
      where: {
        userId: data.userId,
        flashcardId: data.flashcardId,
      },
      orderBy: {
        reviewedAt: 'desc',
      },
    })

    // Calculate next review parameters using SM-2 algorithm
    const nextParams = SpacedRepetitionAlgorithm.calculateNext(
      data.difficulty,
      previousReview?.easeFactor || 2.5,
      previousReview?.interval || 0,
      previousReview?.repetitions || 0
    )

    // Create new review
    const review = await prisma.flashcardReview.create({
      data: {
        userId: data.userId,
        flashcardId: data.flashcardId,
        difficulty: data.difficulty,
        timeSpent: data.timeSpent,
        easeFactor: nextParams.easeFactor,
        interval: nextParams.interval,
        repetitions: nextParams.repetitions,
        nextReview: nextParams.nextReview,
      },
    })

    return review
  }

  /**
   * Get cards due for review
   */
  async getDueCards(userId: string, deckId?: string) {
    const now = new Date()

    // Get all flashcards with their latest review
    const flashcards = await prisma.flashcard.findMany({
      where: deckId ? { deckId } : undefined,
      include: {
        reviews: {
          where: { userId },
          orderBy: { reviewedAt: 'desc' },
          take: 1,
        },
        deck: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Filter cards that are due or never reviewed
    const dueCards = flashcards.filter((card) => {
      if (card.reviews.length === 0) {
        // Never reviewed - it's due
        return true
      }

      const latestReview = card.reviews[0]
      return latestReview.nextReview <= now
    })

    return dueCards
  }

  /**
   * Get study session (cards to study now)
   */
  async getStudySession(userId: string, deckId: string, limit: number = 20) {
    const dueCards = await this.getDueCards(userId, deckId)

    // Prioritize cards: never reviewed > longest overdue > newest
    const sortedCards = dueCards.sort((a, b) => {
      const aReview = a.reviews[0]
      const bReview = b.reviews[0]

      // Cards never reviewed come first
      if (!aReview && bReview) return -1
      if (aReview && !bReview) return 1
      if (!aReview && !bReview) return 0

      // Then sort by how overdue they are
      const aOverdue = Date.now() - aReview!.nextReview.getTime()
      const bOverdue = Date.now() - bReview!.nextReview.getTime()

      return bOverdue - aOverdue
    })

    return sortedCards.slice(0, limit)
  }

  /**
   * Get deck statistics for a user
   */
  async getDeckStatistics(userId: string, deckId: string) {
    const deck = await this.getDeckById(deckId, true)

    const totalCards = deck.flashcards?.length || 0

    // Get user's reviews for this deck
    const reviews = await prisma.flashcardReview.findMany({
      where: {
        userId,
        flashcard: {
          deckId,
        },
      },
    })

    // Get latest review for each card
    const cardReviews = new Map()
    reviews.forEach((review) => {
      const existing = cardReviews.get(review.flashcardId)
      if (!existing || review.reviewedAt > existing.reviewedAt) {
        cardReviews.set(review.flashcardId, review)
      }
    })

    const reviewedCards = cardReviews.size
    const newCards = totalCards - reviewedCards

    // Count due cards
    const now = new Date()
    const dueCards = Array.from(cardReviews.values()).filter(
      (review) => review.nextReview <= now
    ).length

    // Calculate mastery (cards with repetitions >= 3)
    const masteredCards = Array.from(cardReviews.values()).filter(
      (review) => review.repetitions >= 3
    ).length

    return {
      deckId,
      deckTitle: deck.title,
      totalCards,
      newCards,
      dueCards,
      reviewedCards,
      masteredCards,
      masteryPercentage:
        totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0,
    }
  }

  /**
   * Get user's overall flashcard statistics
   */
  async getUserStatistics(userId: string) {
    const decks = await prisma.flashcardDeck.findMany({
      where: {
        OR: [{ createdById: userId }, { isPublic: true }],
      },
      include: {
        _count: {
          select: {
            flashcards: true,
          },
        },
      },
    })

    const deckStats = await Promise.all(
      decks.map((deck) => this.getDeckStatistics(userId, deck.id))
    )

    const totalDecks = decks.length
    const totalCards = deckStats.reduce((sum, stat) => sum + stat.totalCards, 0)
    const totalDue = deckStats.reduce((sum, stat) => sum + stat.dueCards, 0)
    const totalMastered = deckStats.reduce(
      (sum, stat) => sum + stat.masteredCards,
      0
    )

    return {
      totalDecks,
      totalCards,
      totalDue,
      totalMastered,
      overallMastery:
        totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0,
      decks: deckStats,
    }
  }
}

export default new FlashcardService()

import { Request, Response } from 'express'
import flashcardService from '../services/flashcardService'

class FlashcardController {
  /**
   * Create a new flashcard deck
   * POST /api/flashcards/decks
   */
  async createDeck(req: Request, res: Response) {
    try {
      const { title, description, courseId, lessonId, isPublic, tags } = req.body
      const userId = (req as any).user.id

      if (!title) {
        return res.status(400).json({ message: 'Title is required' })
      }

      const deck = await flashcardService.createDeck({
        title,
        description,
        courseId,
        lessonId,
        createdById: userId,
        isPublic,
        tags,
      })

      res.status(201).json({
        success: true,
        data: deck,
      })
    } catch (error) {
      console.error('Error creating deck:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get all decks
   * GET /api/flashcards/decks
   */
  async getDecks(req: Request, res: Response) {
    try {
      const { courseId, lessonId, createdById, isPublic } = req.query

      const filters: any = {}
      if (courseId) filters.courseId = courseId as string
      if (lessonId) filters.lessonId = lessonId as string
      if (createdById) filters.createdById = createdById as string
      if (isPublic !== undefined) filters.isPublic = isPublic === 'true'

      const decks = await flashcardService.getDecks(filters)

      res.json({
        success: true,
        data: decks,
      })
    } catch (error) {
      console.error('Error getting decks:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get a single deck
   * GET /api/flashcards/decks/:id
   */
  async getDeck(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { includeCards } = req.query

      const deck = await flashcardService.getDeckById(
        id,
        includeCards === 'true'
      )

      res.json({
        success: true,
        data: deck,
      })
    } catch (error: any) {
      console.error('Error getting deck:', error)
      if (error.message === 'Deck not found') {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Update a deck
   * PUT /api/flashcards/decks/:id
   */
  async updateDeck(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateData = req.body

      const deck = await flashcardService.updateDeck(id, updateData)

      res.json({
        success: true,
        data: deck,
      })
    } catch (error) {
      console.error('Error updating deck:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Delete a deck
   * DELETE /api/flashcards/decks/:id
   */
  async deleteDeck(req: Request, res: Response) {
    try {
      const { id } = req.params

      await flashcardService.deleteDeck(id)

      res.json({
        success: true,
        message: 'Deck deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting deck:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Create a flashcard
   * POST /api/flashcards/decks/:deckId/cards
   */
  async createFlashcard(req: Request, res: Response) {
    try {
      const { deckId } = req.params
      const { front, back, hint, image } = req.body

      if (!front || !back) {
        return res.status(400).json({ message: 'Front and back are required' })
      }

      const flashcard = await flashcardService.createFlashcard({
        deckId,
        front,
        back,
        hint,
        image,
      })

      res.status(201).json({
        success: true,
        data: flashcard,
      })
    } catch (error) {
      console.error('Error creating flashcard:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get flashcards for a deck
   * GET /api/flashcards/decks/:deckId/cards
   */
  async getFlashcards(req: Request, res: Response) {
    try {
      const { deckId } = req.params

      const flashcards = await flashcardService.getFlashcards(deckId)

      res.json({
        success: true,
        data: flashcards,
      })
    } catch (error) {
      console.error('Error getting flashcards:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Update a flashcard
   * PUT /api/flashcards/cards/:id
   */
  async updateFlashcard(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateData = req.body

      const flashcard = await flashcardService.updateFlashcard(id, updateData)

      res.json({
        success: true,
        data: flashcard,
      })
    } catch (error) {
      console.error('Error updating flashcard:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Delete a flashcard
   * DELETE /api/flashcards/cards/:id
   */
  async deleteFlashcard(req: Request, res: Response) {
    try {
      const { id } = req.params

      await flashcardService.deleteFlashcard(id)

      res.json({
        success: true,
        message: 'Flashcard deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting flashcard:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Reorder flashcards
   * PUT /api/flashcards/decks/:deckId/reorder
   */
  async reorderFlashcards(req: Request, res: Response) {
    try {
      const { deckId } = req.params
      const { flashcardIds } = req.body

      if (!Array.isArray(flashcardIds)) {
        return res.status(400).json({ message: 'flashcardIds must be an array' })
      }

      await flashcardService.reorderFlashcards(deckId, flashcardIds)

      res.json({
        success: true,
        message: 'Flashcards reordered successfully',
      })
    } catch (error) {
      console.error('Error reordering flashcards:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Review a flashcard (submit difficulty rating)
   * POST /api/flashcards/cards/:id/review
   */
  async reviewFlashcard(req: Request, res: Response) {
    try {
      const { id: flashcardId } = req.params
      const { difficulty, timeSpent } = req.body
      const userId = (req as any).user.id

      if (!difficulty) {
        return res.status(400).json({ message: 'Difficulty is required' })
      }

      const validDifficulties = ['AGAIN', 'HARD', 'GOOD', 'EASY']
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({
          message: `Difficulty must be one of: ${validDifficulties.join(', ')}`,
        })
      }

      const review = await flashcardService.reviewFlashcard({
        userId,
        flashcardId,
        difficulty,
        timeSpent,
      })

      res.json({
        success: true,
        data: review,
      })
    } catch (error) {
      console.error('Error reviewing flashcard:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get study session (cards due for review)
   * GET /api/flashcards/decks/:deckId/study
   */
  async getStudySession(req: Request, res: Response) {
    try {
      const { deckId } = req.params
      const { limit } = req.query
      const userId = (req as any).user.id

      const cards = await flashcardService.getStudySession(
        userId,
        deckId,
        limit ? parseInt(limit as string) : 20
      )

      res.json({
        success: true,
        data: cards,
      })
    } catch (error) {
      console.error('Error getting study session:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get cards due for review
   * GET /api/flashcards/due
   */
  async getDueCards(req: Request, res: Response) {
    try {
      const { deckId } = req.query
      const userId = (req as any).user.id

      const cards = await flashcardService.getDueCards(
        userId,
        deckId as string | undefined
      )

      res.json({
        success: true,
        data: cards,
      })
    } catch (error) {
      console.error('Error getting due cards:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get deck statistics for user
   * GET /api/flashcards/decks/:deckId/statistics
   */
  async getDeckStatistics(req: Request, res: Response) {
    try {
      const { deckId } = req.params
      const userId = (req as any).user.id

      const statistics = await flashcardService.getDeckStatistics(userId, deckId)

      res.json({
        success: true,
        data: statistics,
      })
    } catch (error) {
      console.error('Error getting deck statistics:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Get user's overall flashcard statistics
   * GET /api/flashcards/statistics
   */
  async getUserStatistics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id

      const statistics = await flashcardService.getUserStatistics(userId)

      res.json({
        success: true,
        data: statistics,
      })
    } catch (error) {
      console.error('Error getting user statistics:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new FlashcardController()

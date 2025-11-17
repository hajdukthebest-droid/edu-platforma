import { Router } from 'express'
import flashcardController from '../controllers/flashcardController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All flashcard routes require authentication
router.use(authenticate)

// Deck routes
router.post('/decks', flashcardController.createDeck)
router.get('/decks', flashcardController.getDecks)
router.get('/decks/:id', flashcardController.getDeck)
router.put('/decks/:id', flashcardController.updateDeck)
router.delete('/decks/:id', flashcardController.deleteDeck)

// Flashcard routes
router.post('/decks/:deckId/cards', flashcardController.createFlashcard)
router.get('/decks/:deckId/cards', flashcardController.getFlashcards)
router.put('/cards/:id', flashcardController.updateFlashcard)
router.delete('/cards/:id', flashcardController.deleteFlashcard)
router.put('/decks/:deckId/reorder', flashcardController.reorderFlashcards)

// Study routes
router.get('/decks/:deckId/study', flashcardController.getStudySession)
router.post('/cards/:id/review', flashcardController.reviewFlashcard)
router.get('/due', flashcardController.getDueCards)

// Statistics routes
router.get('/decks/:deckId/statistics', flashcardController.getDeckStatistics)
router.get('/statistics', flashcardController.getUserStatistics)

export default router

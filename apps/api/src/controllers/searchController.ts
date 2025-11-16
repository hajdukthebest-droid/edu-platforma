import { Request, Response, NextFunction } from 'express'
import { searchService, SearchFilters } from '../services/searchService'

export class SearchController {
  async searchCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: SearchFilters = {
        query: req.query.q as string || '',
        category: req.query.category as string,
        domain: req.query.domain as string,
        level: req.query.level as string,
        priceRange: req.query.minPrice || req.query.maxPrice ? {
          min: parseFloat(req.query.minPrice as string) || 0,
          max: parseFloat(req.query.maxPrice as string) || 999999,
        } : undefined,
        rating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as any || 'relevance',
      }

      const results = await searchService.searchCourses(filters)

      res.json({
        status: 'success',
        data: results,
      })
    } catch (error) {
      next(error)
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string || ''
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20

      const results = await searchService.searchUsers(query, page, limit)

      res.json({
        status: 'success',
        data: results,
      })
    } catch (error) {
      next(error)
    }
  }

  async searchForumPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string || ''
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20

      const results = await searchService.searchForumPosts(query, page, limit)

      res.json({
        status: 'success',
        data: results,
      })
    } catch (error) {
      next(error)
    }
  }

  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string || ''
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10

      const results = await searchService.globalSearch(query, page, limit)

      res.json({
        status: 'success',
        data: results,
      })
    } catch (error) {
      next(error)
    }
  }

  async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string || ''
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10

      const suggestions = await searchService.getSuggestions(query, limit)

      res.json({
        status: 'success',
        data: suggestions,
      })
    } catch (error) {
      next(error)
    }
  }

  async getPopularSearches(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10

      const popularSearches = await searchService.getPopularSearches(limit)

      res.json({
        status: 'success',
        data: popularSearches,
      })
    } catch (error) {
      next(error)
    }
  }

  async getSearchFacets(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string || ''
      const domain = req.query.domain as string

      const facets = await searchService.getSearchFacets(query, domain)

      res.json({
        status: 'success',
        data: facets,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const searchController = new SearchController()

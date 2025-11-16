import { Request, Response, NextFunction } from 'express'
import { adminService } from '../services/adminService'
import { AuthRequest } from '../middleware/auth'

export class AdminController {
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats()

      res.json({
        status: 'success',
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const filters = {
        search: req.query.search as string,
        role: req.query.role as any,
        status: req.query.status as any,
      }

      const result = await adminService.getUsers(page, limit, filters)

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.updateUserRole(req.params.userId, req.body.role)

      res.json({
        status: 'success',
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.updateUserStatus(req.params.userId, req.body.status)

      res.json({
        status: 'success',
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await adminService.deleteUser(req.params.userId)

      res.json({
        status: 'success',
        message: 'User deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async getAllCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        categoryId: req.query.categoryId as string,
      }

      const result = await adminService.getAllCourses(page, limit, filters)

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateCourseStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await adminService.updateCourseStatus(req.params.courseId, req.body.status)

      res.json({
        status: 'success',
        data: course,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await adminService.deleteCourse(req.params.courseId)

      res.json({
        status: 'success',
        message: 'Course deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

      const analytics = await adminService.getAnalytics(startDate, endDate)

      res.json({
        status: 'success',
        data: analytics,
      })
    } catch (error) {
      next(error)
    }
  }

  async getSystemHealth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const health = await adminService.getSystemHealth()

      res.json({
        status: 'success',
        data: health,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const adminController = new AdminController()

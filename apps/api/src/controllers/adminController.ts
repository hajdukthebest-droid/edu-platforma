import { Request, Response, NextFunction } from 'express'
import { adminAnalyticsService } from '../services/adminAnalyticsService'
import { adminUserService } from '../services/adminUserService'
import { adminCourseService } from '../services/adminCourseService'
import { AuthRequest } from '../middleware/auth'

export class AdminController {
  // ============================================
  // ANALYTICS
  // ============================================

  async getPlatformStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminAnalyticsService.getPlatformStats()
      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  }

  async getUserGrowth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminAnalyticsService.getUserGrowth()
      res.json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async getEnrollmentGrowth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminAnalyticsService.getEnrollmentGrowth()
      res.json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async getRevenueTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminAnalyticsService.getRevenueTrends()
      res.json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async getTopCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10
      const data = await adminAnalyticsService.getTopCourses(limit)
      res.json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async getTopInstructors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10
      const data = await adminAnalyticsService.getTopInstructors(limit)
      res.json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async getDomainStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminAnalyticsService.getDomainStats()
      res.json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async getRecentActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20
      const data = await adminAnalyticsService.getRecentActivity(limit)
      res.json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        role: req.query.role as any,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      }

      const result = await adminUserService.getUsers(query)
      res.json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  async getUserDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminUserService.getUserDetails(req.params.userId)
      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  }

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminUserService.updateUserRole(req.params.userId, req.body.role)
      res.json({ success: true, data: user, message: 'User role updated successfully' })
    } catch (error) {
      next(error)
    }
  }

  async toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminUserService.toggleUserStatus(req.params.userId, req.body.isActive)
      res.json({ success: true, data: user, message: 'User status updated successfully' })
    } catch (error) {
      next(error)
    }
  }

  async verifyUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminUserService.verifyUser(req.params.userId)
      res.json({ success: true, data: user, message: 'User verified successfully' })
    } catch (error) {
      next(error)
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await adminUserService.deleteUser(req.params.userId)
      res.json({ success: true, message: 'User deleted successfully' })
    } catch (error) {
      next(error)
    }
  }

  async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminUserService.getUserStats(req.params.userId)
      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  }

  async bulkUpdateUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userIds, updates } = req.body
      const result = await adminUserService.bulkUpdateUsers(userIds, updates)
      res.json({ success: true, data: result, message: 'Users updated successfully' })
    } catch (error) {
      next(error)
    }
  }

  // ============================================
  // COURSE MANAGEMENT
  // ============================================

  async getCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        status: req.query.status as any,
        domainId: req.query.domainId as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      }

      const result = await adminCourseService.getCourses(query)
      res.json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  async approveCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await adminCourseService.approveCourse(req.params.courseId, req.user!.id)
      res.json({ success: true, data: course, message: 'Course approved successfully' })
    } catch (error) {
      next(error)
    }
  }

  async rejectCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body
      const course = await adminCourseService.rejectCourse(req.params.courseId, req.user!.id, reason)
      res.json({ success: true, data: course, message: 'Course rejected successfully' })
    } catch (error) {
      next(error)
    }
  }

  async archiveCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await adminCourseService.archiveCourse(req.params.courseId)
      res.json({ success: true, data: course, message: 'Course archived successfully' })
    } catch (error) {
      next(error)
    }
  }

  async toggleFeaturedCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await adminCourseService.toggleFeaturedCourse(req.params.courseId, req.body.isFeatured)
      res.json({ success: true, data: course, message: 'Course featured status updated' })
    } catch (error) {
      next(error)
    }
  }

  async deleteCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await adminCourseService.deleteCourse(req.params.courseId)
      res.json({ success: true, message: 'Course deleted successfully' })
    } catch (error) {
      next(error)
    }
  }

  async getPendingCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const courses = await adminCourseService.getPendingCourses()
      res.json({ success: true, data: courses })
    } catch (error) {
      next(error)
    }
  }

  async getCourseStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminCourseService.getCourseStats(req.params.courseId)
      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  }

  async bulkUpdateCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseIds, updates } = req.body
      const result = await adminCourseService.bulkUpdateCourses(courseIds, updates)
      res.json({ success: true, data: result, message: 'Courses updated successfully' })
    } catch (error) {
      next(error)
    }
  }
}

export const adminController = new AdminController()

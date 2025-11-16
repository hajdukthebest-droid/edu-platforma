import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { Prisma, TemplateCategory, LessonType } from '@prisma/client'

interface CreateTemplateData {
  name: string
  description?: string
  category: TemplateCategory
  lessonType: LessonType
  contentStructure: any
  thumbnail?: string
}

export class CourseBuilderService {
  // ============================================
  // CONTENT TEMPLATES
  // ============================================

  async getTemplates(filters?: { category?: TemplateCategory; lessonType?: LessonType }) {
    const where: Prisma.ContentTemplateWhereInput = {
      isPublic: true,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.lessonType && { lessonType: filters.lessonType }),
    }

    const templates = await prisma.contentTemplate.findMany({
      where,
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
    })

    return templates
  }

  async getTemplateById(templateId: string) {
    const template = await prisma.contentTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      throw new AppError(404, 'Template not found')
    }

    return template
  }

  async createTemplate(data: CreateTemplateData, createdById?: string) {
    const template = await prisma.contentTemplate.create({
      data: {
        ...data,
        createdById,
      },
    })

    return template
  }

  async deleteTemplate(templateId: string) {
    await prisma.contentTemplate.delete({
      where: { id: templateId },
    })
  }

  // ============================================
  // MODULE OPERATIONS
  // ============================================

  async reorderModules(courseId: string, moduleOrders: { moduleId: string; orderIndex: number }[]) {
    // Verify course exists and user has access (should be done in controller)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    // Update all modules in transaction
    await prisma.$transaction(
      moduleOrders.map(({ moduleId, orderIndex }) =>
        prisma.module.update({
          where: { id: moduleId },
          data: { orderIndex },
        })
      )
    )

    return { success: true, message: 'Modules reordered successfully' }
  }

  async duplicateModule(moduleId: string, userId: string) {
    const originalModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
        course: true,
      },
    })

    if (!originalModule) {
      throw new AppError(404, 'Module not found')
    }

    // Verify ownership
    if (originalModule.course.creatorId !== userId) {
      throw new AppError(403, 'You can only duplicate your own modules')
    }

    // Get max orderIndex for the course
    const maxOrderModule = await prisma.module.findFirst({
      where: { courseId: originalModule.courseId },
      orderBy: { orderIndex: 'desc' },
    })

    const newOrderIndex = (maxOrderModule?.orderIndex || 0) + 1

    // Create new module with all lessons
    const newModule = await prisma.module.create({
      data: {
        courseId: originalModule.courseId,
        title: `${originalModule.title} (Copy)`,
        description: originalModule.description,
        orderIndex: newOrderIndex,
        duration: originalModule.duration,
        lessons: {
          create: originalModule.lessons.map((lesson, index) => ({
            title: lesson.title,
            description: lesson.description,
            type: lesson.type,
            orderIndex: index,
            duration: lesson.duration,
            content: lesson.content,
            contentBlocks: lesson.contentBlocks,
            videoUrl: lesson.videoUrl,
            videoProvider: lesson.videoProvider,
            videoDuration: lesson.videoDuration,
            attachments: lesson.attachments,
            templateId: lesson.templateId,
            isDraft: true, // Set as draft for review
            isPreview: lesson.isPreview,
            isMandatory: lesson.isMandatory,
            pointsReward: lesson.pointsReward,
          })),
        },
      },
      include: {
        lessons: true,
      },
    })

    return newModule
  }

  // ============================================
  // LESSON OPERATIONS
  // ============================================

  async reorderLessons(moduleId: string, lessonOrders: { lessonId: string; orderIndex: number }[]) {
    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    })

    if (!module) {
      throw new AppError(404, 'Module not found')
    }

    // Update all lessons in transaction
    await prisma.$transaction(
      lessonOrders.map(({ lessonId, orderIndex }) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { orderIndex },
        })
      )
    )

    return { success: true, message: 'Lessons reordered successfully' }
  }

  async duplicateLesson(lessonId: string, userId: string) {
    const originalLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!originalLesson) {
      throw new AppError(404, 'Lesson not found')
    }

    // Verify ownership
    if (originalLesson.module.course.creatorId !== userId) {
      throw new AppError(403, 'You can only duplicate your own lessons')
    }

    // Get max orderIndex for the module
    const maxOrderLesson = await prisma.lesson.findFirst({
      where: { moduleId: originalLesson.moduleId },
      orderBy: { orderIndex: 'desc' },
    })

    const newOrderIndex = (maxOrderLesson?.orderIndex || 0) + 1

    // Create duplicate lesson
    const newLesson = await prisma.lesson.create({
      data: {
        moduleId: originalLesson.moduleId,
        title: `${originalLesson.title} (Copy)`,
        description: originalLesson.description,
        type: originalLesson.type,
        orderIndex: newOrderIndex,
        duration: originalLesson.duration,
        content: originalLesson.content,
        contentBlocks: originalLesson.contentBlocks,
        videoUrl: originalLesson.videoUrl,
        videoProvider: originalLesson.videoProvider,
        videoDuration: originalLesson.videoDuration,
        attachments: originalLesson.attachments,
        templateId: originalLesson.templateId,
        isDraft: true, // Set as draft for review
        isPreview: originalLesson.isPreview,
        isMandatory: originalLesson.isMandatory,
        pointsReward: originalLesson.pointsReward,
      },
    })

    return newLesson
  }

  async createLessonFromTemplate(
    moduleId: string,
    templateId: string,
    data: { title: string; description?: string }
  ) {
    const template = await prisma.contentTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      throw new AppError(404, 'Template not found')
    }

    // Get max orderIndex for the module
    const maxOrderLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: 'desc' },
    })

    const newOrderIndex = (maxOrderLesson?.orderIndex || 0) + 1

    // Create lesson from template
    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        description: data.description,
        type: template.lessonType,
        orderIndex: newOrderIndex,
        contentBlocks: template.contentStructure, // Use template structure
        templateId: template.id,
        isDraft: true,
      },
    })

    // Increment template usage count
    await prisma.contentTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    })

    return lesson
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  async exportCourse(courseId: string, userId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!course) {
      throw new AppError(404, 'Course not found')
    }

    if (course.creatorId !== userId) {
      throw new AppError(403, 'You can only export your own courses')
    }

    // Return course structure as JSON
    const exportData = {
      title: course.title,
      description: course.description,
      level: course.level,
      language: course.language,
      tags: course.tags,
      learningObjectives: course.learningObjectives,
      requirements: course.requirements,
      targetAudience: course.targetAudience,
      modules: course.modules.map((module) => ({
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        lessons: module.lessons.map((lesson) => ({
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          orderIndex: lesson.orderIndex,
          duration: lesson.duration,
          content: lesson.content,
          contentBlocks: lesson.contentBlocks,
          videoUrl: lesson.videoUrl,
          videoProvider: lesson.videoProvider,
          attachments: lesson.attachments,
          isPreview: lesson.isPreview,
          isMandatory: lesson.isMandatory,
          pointsReward: lesson.pointsReward,
        })),
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }

    return exportData
  }

  // Move module to different position
  async moveModule(moduleId: string, newOrderIndex: number, userId: string) {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    })

    if (!module) {
      throw new AppError(404, 'Module not found')
    }

    if (module.course.creatorId !== userId) {
      throw new AppError(403, 'You can only move your own modules')
    }

    const oldOrderIndex = module.orderIndex

    // Get all modules in the course
    const modules = await prisma.module.findMany({
      where: { courseId: module.courseId },
      orderBy: { orderIndex: 'asc' },
    })

    // Calculate new order indices
    const updates = modules.map((m) => {
      if (m.id === moduleId) {
        return { id: m.id, orderIndex: newOrderIndex }
      }

      // Shift other modules
      if (newOrderIndex < oldOrderIndex) {
        // Moving up
        if (m.orderIndex >= newOrderIndex && m.orderIndex < oldOrderIndex) {
          return { id: m.id, orderIndex: m.orderIndex + 1 }
        }
      } else {
        // Moving down
        if (m.orderIndex > oldOrderIndex && m.orderIndex <= newOrderIndex) {
          return { id: m.id, orderIndex: m.orderIndex - 1 }
        }
      }

      return { id: m.id, orderIndex: m.orderIndex }
    })

    // Apply updates in transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.module.update({
          where: { id: update.id },
          data: { orderIndex: update.orderIndex },
        })
      )
    )

    return { success: true, message: 'Module moved successfully' }
  }

  // Move lesson to different module or position
  async moveLesson(
    lessonId: string,
    targetModuleId: string,
    newOrderIndex: number,
    userId: string
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: true },
        },
      },
    })

    if (!lesson) {
      throw new AppError(404, 'Lesson not found')
    }

    if (lesson.module.course.creatorId !== userId) {
      throw new AppError(403, 'You can only move your own lessons')
    }

    const isSameModule = lesson.moduleId === targetModuleId

    if (isSameModule) {
      // Just reorder within same module
      const oldOrderIndex = lesson.orderIndex

      const lessons = await prisma.lesson.findMany({
        where: { moduleId: targetModuleId },
        orderBy: { orderIndex: 'asc' },
      })

      const updates = lessons.map((l) => {
        if (l.id === lessonId) {
          return { id: l.id, orderIndex: newOrderIndex }
        }

        if (newOrderIndex < oldOrderIndex) {
          if (l.orderIndex >= newOrderIndex && l.orderIndex < oldOrderIndex) {
            return { id: l.id, orderIndex: l.orderIndex + 1 }
          }
        } else {
          if (l.orderIndex > oldOrderIndex && l.orderIndex <= newOrderIndex) {
            return { id: l.id, orderIndex: l.orderIndex - 1 }
          }
        }

        return { id: l.id, orderIndex: l.orderIndex }
      })

      await prisma.$transaction(
        updates.map((update) =>
          prisma.lesson.update({
            where: { id: update.id },
            data: { orderIndex: update.orderIndex },
          })
        )
      )
    } else {
      // Moving to different module
      // 1. Remove from old module (shift lessons down)
      await prisma.lesson.updateMany({
        where: {
          moduleId: lesson.moduleId,
          orderIndex: { gt: lesson.orderIndex },
        },
        data: {
          orderIndex: {
            decrement: 1,
          },
        },
      })

      // 2. Make space in new module (shift lessons up)
      await prisma.lesson.updateMany({
        where: {
          moduleId: targetModuleId,
          orderIndex: { gte: newOrderIndex },
        },
        data: {
          orderIndex: {
            increment: 1,
          },
        },
      })

      // 3. Move the lesson
      await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          moduleId: targetModuleId,
          orderIndex: newOrderIndex,
        },
      })
    }

    return { success: true, message: 'Lesson moved successfully' }
  }
}

export const courseBuilderService = new CourseBuilderService()

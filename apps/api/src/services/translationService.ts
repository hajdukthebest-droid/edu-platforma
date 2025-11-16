import { PrismaClient, SupportedLocale } from '@prisma/client'

const prisma = new PrismaClient()

class TranslationService {
  /**
   * Get course with translations
   */
  async getCourseWithTranslation(courseId: string, locale: SupportedLocale) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        translations: {
          where: { locale },
        },
        modules: {
          include: {
            translations: {
              where: { locale },
            },
            lessons: {
              include: {
                translations: {
                  where: { locale },
                },
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!course) return null

    // Apply translations if they exist
    if (course.translations.length > 0) {
      const translation = course.translations[0]
      return {
        ...course,
        title: translation.title,
        description: translation.description || course.description,
        shortDescription: translation.shortDescription || course.shortDescription,
        learningObjectives: translation.learningObjectives || course.learningObjectives,
        requirements: translation.requirements || course.requirements,
        targetAudience: translation.targetAudience || course.targetAudience,
        modules: course.modules.map((module) => {
          const moduleTranslation = module.translations[0]
          return {
            ...module,
            title: moduleTranslation?.title || module.title,
            description: moduleTranslation?.description || module.description,
            lessons: module.lessons.map((lesson) => {
              const lessonTranslation = lesson.translations[0]
              return {
                ...lesson,
                title: lessonTranslation?.title || lesson.title,
                description: lessonTranslation?.description || lesson.description,
                content: lessonTranslation?.content || lesson.content,
              }
            }),
          }
        }),
      }
    }

    return course
  }

  /**
   * Create or update course translation
   */
  async upsertCourseTranslation(
    courseId: string,
    locale: SupportedLocale,
    data: {
      title: string
      description?: string
      shortDescription?: string
      learningObjectives?: string[]
      requirements?: string[]
      targetAudience?: string
    }
  ) {
    return await prisma.courseTranslation.upsert({
      where: {
        courseId_locale: {
          courseId,
          locale,
        },
      },
      create: {
        courseId,
        locale,
        ...data,
      },
      update: data,
    })
  }

  /**
   * Create or update module translation
   */
  async upsertModuleTranslation(
    moduleId: string,
    locale: SupportedLocale,
    data: {
      title: string
      description?: string
    }
  ) {
    return await prisma.moduleTranslation.upsert({
      where: {
        moduleId_locale: {
          moduleId,
          locale,
        },
      },
      create: {
        moduleId,
        locale,
        ...data,
      },
      update: data,
    })
  }

  /**
   * Create or update lesson translation
   */
  async upsertLessonTranslation(
    lessonId: string,
    locale: SupportedLocale,
    data: {
      title: string
      description?: string
      content?: string
    }
  ) {
    return await prisma.lessonTranslation.upsert({
      where: {
        lessonId_locale: {
          lessonId,
          locale,
        },
      },
      create: {
        lessonId,
        locale,
        ...data,
      },
      update: data,
    })
  }

  /**
   * Delete course translation
   */
  async deleteCourseTranslation(courseId: string, locale: SupportedLocale) {
    return await prisma.courseTranslation.delete({
      where: {
        courseId_locale: {
          courseId,
          locale,
        },
      },
    })
  }

  /**
   * Delete module translation
   */
  async deleteModuleTranslation(moduleId: string, locale: SupportedLocale) {
    return await prisma.moduleTranslation.delete({
      where: {
        moduleId_locale: {
          moduleId,
          locale,
        },
      },
    })
  }

  /**
   * Delete lesson translation
   */
  async deleteLessonTranslation(lessonId: string, locale: SupportedLocale) {
    return await prisma.lessonTranslation.delete({
      where: {
        lessonId_locale: {
          lessonId,
          locale,
        },
      },
    })
  }

  /**
   * Check if translation exists
   */
  async translationExists(
    type: 'course' | 'module' | 'lesson',
    id: string,
    locale: SupportedLocale
  ): Promise<boolean> {
    let count = 0

    switch (type) {
      case 'course':
        count = await prisma.courseTranslation.count({
          where: { courseId: id, locale },
        })
        break
      case 'module':
        count = await prisma.moduleTranslation.count({
          where: { moduleId: id, locale },
        })
        break
      case 'lesson':
        count = await prisma.lessonTranslation.count({
          where: { lessonId: id, locale },
        })
        break
    }

    return count > 0
  }

  /**
   * Get translation completion status for a course
   */
  async getCourseTranslationStatus(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        translations: true,
        modules: {
          include: {
            translations: true,
            lessons: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    })

    if (!course) return null

    const totalModules = course.modules.length
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)

    const locales: SupportedLocale[] = ['HR', 'EN']
    const status: any = {}

    for (const locale of locales) {
      const courseHasTranslation = course.translations.some((t) => t.locale === locale)
      const translatedModules = course.modules.filter((m) =>
        m.translations.some((t) => t.locale === locale)
      ).length
      const translatedLessons = course.modules.reduce(
        (sum, m) =>
          sum +
          m.lessons.filter((l) => l.translations.some((t) => t.locale === locale)).length,
        0
      )

      const totalItems = 1 + totalModules + totalLessons // course + modules + lessons
      const translatedItems =
        (courseHasTranslation ? 1 : 0) + translatedModules + translatedLessons

      status[locale] = {
        isComplete: translatedItems === totalItems,
        completionPercentage:
          totalItems > 0 ? Math.round((translatedItems / totalItems) * 100) : 0,
        courseTranslated: courseHasTranslation,
        modulesTranslated: translatedModules,
        totalModules,
        lessonsTranslated: translatedLessons,
        totalLessons,
      }
    }

    return status
  }
}

export default new TranslationService()

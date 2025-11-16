import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface VersionDiff {
  field: string
  oldValue: any
  newValue: any
}

class VersioningService {
  /**
   * Create a new course version snapshot
   */
  async createCourseVersion(
    courseId: string,
    userId: string,
    changeDescription?: string
  ) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new Error('Course not found')
    }

    // Get the latest version number
    const latestVersion = await prisma.courseVersion.findFirst({
      where: { courseId },
      orderBy: { version: 'desc' },
    })

    const newVersion = (latestVersion?.version || 0) + 1

    // Create version snapshot
    const version = await prisma.courseVersion.create({
      data: {
        courseId,
        version: newVersion,
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription,
        level: course.level,
        language: course.language,
        duration: course.duration,
        price: course.price,
        tags: course.tags,
        learningObjectives: course.learningObjectives,
        requirements: course.requirements,
        targetAudience: course.targetAudience,
        changeDescription,
        createdById: userId,
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
      },
    })

    return version
  }

  /**
   * Create a new module version snapshot
   */
  async createModuleVersion(
    moduleId: string,
    userId: string,
    changeDescription?: string
  ) {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    })

    if (!module) {
      throw new Error('Module not found')
    }

    const latestVersion = await prisma.moduleVersion.findFirst({
      where: { moduleId },
      orderBy: { version: 'desc' },
    })

    const newVersion = (latestVersion?.version || 0) + 1

    const version = await prisma.moduleVersion.create({
      data: {
        moduleId,
        version: newVersion,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        changeDescription,
        createdById: userId,
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
      },
    })

    return version
  }

  /**
   * Create a new lesson version snapshot
   */
  async createLessonVersion(
    lessonId: string,
    userId: string,
    changeDescription?: string
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    })

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    const latestVersion = await prisma.lessonVersion.findFirst({
      where: { lessonId },
      orderBy: { version: 'desc' },
    })

    const newVersion = (latestVersion?.version || 0) + 1

    const version = await prisma.lessonVersion.create({
      data: {
        lessonId,
        version: newVersion,
        title: lesson.title,
        content: lesson.content,
        type: lesson.type,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        videoUrl: lesson.videoUrl,
        isFree: lesson.isFree,
        changeDescription,
        createdById: userId,
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
      },
    })

    return version
  }

  /**
   * Get version history for a course
   */
  async getCourseVersionHistory(courseId: string) {
    const versions = await prisma.courseVersion.findMany({
      where: { courseId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    })

    return versions
  }

  /**
   * Get version history for a module
   */
  async getModuleVersionHistory(moduleId: string) {
    const versions = await prisma.moduleVersion.findMany({
      where: { moduleId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    })

    return versions
  }

  /**
   * Get version history for a lesson
   */
  async getLessonVersionHistory(lessonId: string) {
    const versions = await prisma.lessonVersion.findMany({
      where: { lessonId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    })

    return versions
  }

  /**
   * Get a specific course version
   */
  async getCourseVersion(courseId: string, version: number) {
    const courseVersion = await prisma.courseVersion.findUnique({
      where: {
        courseId_version: {
          courseId,
          version,
        },
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
      },
    })

    if (!courseVersion) {
      throw new Error('Version not found')
    }

    return courseVersion
  }

  /**
   * Get a specific module version
   */
  async getModuleVersion(moduleId: string, version: number) {
    const moduleVersion = await prisma.moduleVersion.findUnique({
      where: {
        moduleId_version: {
          moduleId,
          version,
        },
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
      },
    })

    if (!moduleVersion) {
      throw new Error('Version not found')
    }

    return moduleVersion
  }

  /**
   * Get a specific lesson version
   */
  async getLessonVersion(lessonId: string, version: number) {
    const lessonVersion = await prisma.lessonVersion.findUnique({
      where: {
        lessonId_version: {
          lessonId,
          version,
        },
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
      },
    })

    if (!lessonVersion) {
      throw new Error('Version not found')
    }

    return lessonVersion
  }

  /**
   * Rollback course to a specific version
   */
  async rollbackCourse(courseId: string, version: number, userId: string) {
    const courseVersion = await this.getCourseVersion(courseId, version)

    // Create a new version before rollback to preserve current state
    await this.createCourseVersion(courseId, userId, `Rollback to version ${version}`)

    // Update course with version data
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: courseVersion.title,
        description: courseVersion.description,
        shortDescription: courseVersion.shortDescription,
        level: courseVersion.level,
        language: courseVersion.language,
        duration: courseVersion.duration,
        price: courseVersion.price,
        tags: courseVersion.tags,
        learningObjectives: courseVersion.learningObjectives,
        requirements: courseVersion.requirements,
        targetAudience: courseVersion.targetAudience,
      },
    })

    return updatedCourse
  }

  /**
   * Rollback module to a specific version
   */
  async rollbackModule(moduleId: string, version: number, userId: string) {
    const moduleVersion = await this.getModuleVersion(moduleId, version)

    // Create a new version before rollback
    await this.createModuleVersion(moduleId, userId, `Rollback to version ${version}`)

    // Update module with version data
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title: moduleVersion.title,
        description: moduleVersion.description,
        orderIndex: moduleVersion.orderIndex,
      },
    })

    return updatedModule
  }

  /**
   * Rollback lesson to a specific version
   */
  async rollbackLesson(lessonId: string, version: number, userId: string) {
    const lessonVersion = await this.getLessonVersion(lessonId, version)

    // Create a new version before rollback
    await this.createLessonVersion(lessonId, userId, `Rollback to version ${version}`)

    // Update lesson with version data
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: lessonVersion.title,
        content: lessonVersion.content,
        type: lessonVersion.type,
        duration: lessonVersion.duration,
        orderIndex: lessonVersion.orderIndex,
        videoUrl: lessonVersion.videoUrl,
        isFree: lessonVersion.isFree,
      },
    })

    return updatedLesson
  }

  /**
   * Compare two course versions
   */
  async compareCourseVersions(
    courseId: string,
    version1: number,
    version2: number
  ): Promise<VersionDiff[]> {
    const [v1, v2] = await Promise.all([
      this.getCourseVersion(courseId, version1),
      this.getCourseVersion(courseId, version2),
    ])

    const diffs: VersionDiff[] = []
    const fields = [
      'title',
      'description',
      'shortDescription',
      'level',
      'language',
      'duration',
      'price',
      'tags',
      'learningObjectives',
      'requirements',
      'targetAudience',
    ]

    for (const field of fields) {
      const val1 = (v1 as any)[field]
      const val2 = (v2 as any)[field]

      // Deep comparison for arrays and objects
      const isDifferent =
        JSON.stringify(val1) !== JSON.stringify(val2)

      if (isDifferent) {
        diffs.push({
          field,
          oldValue: val1,
          newValue: val2,
        })
      }
    }

    return diffs
  }

  /**
   * Compare two module versions
   */
  async compareModuleVersions(
    moduleId: string,
    version1: number,
    version2: number
  ): Promise<VersionDiff[]> {
    const [v1, v2] = await Promise.all([
      this.getModuleVersion(moduleId, version1),
      this.getModuleVersion(moduleId, version2),
    ])

    const diffs: VersionDiff[] = []
    const fields = ['title', 'description', 'orderIndex']

    for (const field of fields) {
      const val1 = (v1 as any)[field]
      const val2 = (v2 as any)[field]

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        diffs.push({
          field,
          oldValue: val1,
          newValue: val2,
        })
      }
    }

    return diffs
  }

  /**
   * Compare two lesson versions
   */
  async compareLessonVersions(
    lessonId: string,
    version1: number,
    version2: number
  ): Promise<VersionDiff[]> {
    const [v1, v2] = await Promise.all([
      this.getLessonVersion(lessonId, version1),
      this.getLessonVersion(lessonId, version2),
    ])

    const diffs: VersionDiff[] = []
    const fields = [
      'title',
      'content',
      'type',
      'duration',
      'orderIndex',
      'videoUrl',
      'isFree',
    ]

    for (const field of fields) {
      const val1 = (v1 as any)[field]
      const val2 = (v2 as any)[field]

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        diffs.push({
          field,
          oldValue: val1,
          newValue: val2,
        })
      }
    }

    return diffs
  }

  /**
   * Get latest version number for a course
   */
  async getLatestCourseVersion(courseId: string): Promise<number> {
    const latest = await prisma.courseVersion.findFirst({
      where: { courseId },
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    return latest?.version || 0
  }

  /**
   * Get latest version number for a module
   */
  async getLatestModuleVersion(moduleId: string): Promise<number> {
    const latest = await prisma.moduleVersion.findFirst({
      where: { moduleId },
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    return latest?.version || 0
  }

  /**
   * Get latest version number for a lesson
   */
  async getLatestLessonVersion(lessonId: string): Promise<number> {
    const latest = await prisma.lessonVersion.findFirst({
      where: { lessonId },
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    return latest?.version || 0
  }

  /**
   * Delete old versions (keep only last N versions)
   */
  async cleanupOldVersions(
    entityType: 'course' | 'module' | 'lesson',
    entityId: string,
    keepLastN: number = 10
  ) {
    let versions: any[]

    switch (entityType) {
      case 'course':
        versions = await prisma.courseVersion.findMany({
          where: { courseId: entityId },
          orderBy: { version: 'desc' },
          select: { id: true, version: true },
        })
        break
      case 'module':
        versions = await prisma.moduleVersion.findMany({
          where: { moduleId: entityId },
          orderBy: { version: 'desc' },
          select: { id: true, version: true },
        })
        break
      case 'lesson':
        versions = await prisma.lessonVersion.findMany({
          where: { lessonId: entityId },
          orderBy: { version: 'desc' },
          select: { id: true, version: true },
        })
        break
    }

    if (versions.length <= keepLastN) {
      return { deleted: 0 }
    }

    const versionsToDelete = versions.slice(keepLastN)
    const idsToDelete = versionsToDelete.map((v) => v.id)

    let deleteResult

    switch (entityType) {
      case 'course':
        deleteResult = await prisma.courseVersion.deleteMany({
          where: { id: { in: idsToDelete } },
        })
        break
      case 'module':
        deleteResult = await prisma.moduleVersion.deleteMany({
          where: { id: { in: idsToDelete } },
        })
        break
      case 'lesson':
        deleteResult = await prisma.lessonVersion.deleteMany({
          where: { id: { in: idsToDelete } },
        })
        break
    }

    return { deleted: deleteResult.count }
  }
}

export default new VersioningService()

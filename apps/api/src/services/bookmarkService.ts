import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'

interface CreateBookmarkData {
  lessonId: string
  note?: string
}

export class BookmarkService {
  async createBookmark(userId: string, data: CreateBookmarkData) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
    })

    if (!lesson) {
      throw new AppError(404, 'Lesson not found')
    }

    // Check if bookmark already exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: data.lessonId,
        },
      },
    })

    if (existing) {
      throw new AppError(400, 'Bookmark already exists for this lesson')
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        lessonId: data.lessonId,
        note: data.note,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
            orderIndex: true,
            module: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return bookmark
  }

  async getUserBookmarks(userId: string, filters?: {
    courseId?: string
    page?: number
    limit?: number
  }) {
    const { courseId, page = 1, limit = 50 } = filters || {}

    const where: any = { userId }

    if (courseId) {
      where.lesson = {
        module: {
          courseId,
        },
      }
    }

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              type: true,
              orderIndex: true,
              module: {
                select: {
                  id: true,
                  title: true,
                  orderIndex: true,
                  course: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bookmark.count({ where }),
    ])

    return {
      bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getBookmarkById(bookmarkId: string, userId: string) {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
            module: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!bookmark) {
      throw new AppError(404, 'Bookmark not found')
    }

    return bookmark
  }

  async updateBookmark(bookmarkId: string, userId: string, note?: string) {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    })

    if (!bookmark) {
      throw new AppError(404, 'Bookmark not found')
    }

    const updated = await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { note },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    })

    return updated
  }

  async deleteBookmark(bookmarkId: string, userId: string) {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    })

    if (!bookmark) {
      throw new AppError(404, 'Bookmark not found')
    }

    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    })
  }

  async checkBookmark(userId: string, lessonId: string) {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    })

    return { bookmarked: !!bookmark, bookmark }
  }
}

export const bookmarkService = new BookmarkService()

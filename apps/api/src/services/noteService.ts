import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'

interface CreateNoteData {
  lessonId: string
  content: string
  timestamp?: number
}

interface UpdateNoteData {
  content?: string
  timestamp?: number
}

export class NoteService {
  async createNote(userId: string, data: CreateNoteData) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
    })

    if (!lesson) {
      throw new AppError(404, 'Lesson not found')
    }

    const note = await prisma.note.create({
      data: {
        userId,
        lessonId: data.lessonId,
        content: data.content,
        timestamp: data.timestamp,
      },
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

    return note
  }

  async getUserNotes(userId: string, filters?: {
    lessonId?: string
    courseId?: string
    page?: number
    limit?: number
  }) {
    const { lessonId, courseId, page = 1, limit = 50 } = filters || {}

    const where: any = { userId }

    if (lessonId) {
      where.lessonId = lessonId
    }

    if (courseId) {
      where.lesson = {
        module: {
          courseId,
        },
      }
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.note.count({ where }),
    ])

    return {
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getNoteById(noteId: string, userId: string) {
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
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

    if (!note) {
      throw new AppError(404, 'Note not found')
    }

    return note
  }

  async updateNote(noteId: string, userId: string, data: UpdateNoteData) {
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    })

    if (!note) {
      throw new AppError(404, 'Note not found')
    }

    const updated = await prisma.note.update({
      where: { id: noteId },
      data: {
        content: data.content,
        timestamp: data.timestamp,
      },
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

  async deleteNote(noteId: string, userId: string) {
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
    })

    if (!note) {
      throw new AppError(404, 'Note not found')
    }

    await prisma.note.delete({
      where: { id: noteId },
    })
  }

  async getLessonNotes(userId: string, lessonId: string) {
    const notes = await prisma.note.findMany({
      where: {
        userId,
        lessonId,
      },
      orderBy: [
        { timestamp: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    return notes
  }
}

export const noteService = new NoteService()

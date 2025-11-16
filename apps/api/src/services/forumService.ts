import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { Prisma } from '@prisma/client'
import { notificationService } from './notificationService'

interface CreatePostData {
  categoryId: string
  title: string
  content: string
}

interface CreateCommentData {
  content: string
}

export class ForumService {
  async getCategories() {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    return categories
  }

  async getPosts(categoryId?: string, search?: string, page = 1, limit = 20) {
    const where: Prisma.ForumPostWhereInput = {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumPost.count({ where }),
    ])

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getPostById(id: string) {
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!post) {
      throw new AppError(404, 'Post not found')
    }

    // Increment view count
    await prisma.forumPost.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return post
  }

  async createPost(userId: string, data: CreatePostData) {
    const post = await prisma.forumPost.create({
      data: {
        ...data,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
      },
    })

    // Award points for posting
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: 5,
        },
      },
    })

    return post
  }

  async updatePost(postId: string, userId: string, data: Partial<CreatePostData>) {
    // Check if user owns this post
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      throw new AppError(404, 'Post not found')
    }

    if (post.authorId !== userId) {
      throw new AppError(403, 'You can only edit your own posts')
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
      },
    })

    return updatedPost
  }

  async deletePost(postId: string, userId: string, isAdmin = false) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      throw new AppError(404, 'Post not found')
    }

    if (!isAdmin && post.authorId !== userId) {
      throw new AppError(403, 'You can only delete your own posts')
    }

    await prisma.forumPost.delete({
      where: { id: postId },
    })
  }

  async createComment(postId: string, userId: string, data: CreateCommentData) {
    // Get post details for notification
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    })

    if (!post) {
      throw new AppError(404, 'Post not found')
    }

    const comment = await prisma.forumComment.create({
      data: {
        postId,
        authorId: userId,
        ...data,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    // Award points for commenting
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: 3,
        },
      },
    })

    // Send notification to post author (if not self-comment)
    if (post.authorId !== userId) {
      const commenterName = `${comment.author.firstName} ${comment.author.lastName}`
      await notificationService.notifyForumReply(post.authorId, post.title, post.id, commenterName)
    }

    return comment
  }

  async upvotePost(postId: string, userId: string) {
    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        upvotes: {
          increment: 1,
        },
      },
    })

    // Award points to post author
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    })

    if (post && post.authorId !== userId) {
      await prisma.user.update({
        where: { id: post.authorId },
        data: {
          totalPoints: {
            increment: 1,
          },
        },
      })
    }
  }

  async upvoteComment(commentId: string, userId: string) {
    await prisma.forumComment.update({
      where: { id: commentId },
      data: {
        upvotes: {
          increment: 1,
        },
      },
    })

    // Award points to comment author
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
    })

    if (comment && comment.authorId !== userId) {
      await prisma.user.update({
        where: { id: comment.authorId },
        data: {
          totalPoints: {
            increment: 1,
          },
        },
      })
    }
  }
}

export const forumService = new ForumService()

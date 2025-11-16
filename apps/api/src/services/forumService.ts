import { prisma } from '@edu-platforma/database'
import { AppError } from '../middleware/errorHandler'
import { Prisma, VoteType } from '@prisma/client'
import { notificationService } from './notificationService'

interface CreatePostData {
  categoryId: string
  title: string
  content: string
  courseId?: string
  lessonId?: string
  tags?: string[]
}

interface CreateCommentData {
  content: string
  parentCommentId?: string // For threading
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

  async getPosts(
    categoryId?: string,
    search?: string,
    page = 1,
    limit = 20,
    options?: {
      courseId?: string
      lessonId?: string
      tags?: string[]
      isSolved?: boolean
      sortBy?: 'recent' | 'popular' | 'unanswered'
    }
  ) {
    const where: Prisma.ForumPostWhereInput = {
      ...(categoryId && { categoryId }),
      ...(options?.courseId && { courseId: options.courseId }),
      ...(options?.lessonId && { lessonId: options.lessonId }),
      ...(options?.isSolved !== undefined && { isSolved: options.isSolved }),
      ...(options?.tags && options.tags.length > 0 && {
        tags: {
          hasSome: options.tags,
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    // Determine sort order
    let orderBy: Prisma.ForumPostOrderByWithRelationInput[] = [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ]

    if (options?.sortBy === 'popular') {
      orderBy = [{ isPinned: 'desc' }, { upvotes: 'desc' }, { viewCount: 'desc' }]
    } else if (options?.sortBy === 'unanswered') {
      orderBy = [{ isPinned: 'desc' }, { isSolved: 'asc' }, { createdAt: 'desc' }]
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
        orderBy,
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

  async getPostById(id: string, userId?: string) {
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
          where: {
            parentCommentId: null, // Only get top-level comments
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
            replies: {
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
          orderBy: [{ isBestAnswer: 'desc' }, { createdAt: 'asc' }], // Best answer first
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

    // Get user's votes if userId is provided
    if (userId) {
      const userVotes = await prisma.forumVote.findMany({
        where: {
          userId,
          OR: [{ postId: id }, { commentId: { in: post.comments.map((c) => c.id) } }],
        },
      })

      // Attach user vote info to post and comments
      const postWithVotes = {
        ...post,
        userVote: userVotes.find((v) => v.postId === id)?.voteType,
        comments: post.comments.map((comment) => ({
          ...comment,
          userVote: userVotes.find((v) => v.commentId === comment.id)?.voteType,
          replies: comment.replies.map((reply) => ({
            ...reply,
            userVote: userVotes.find((v) => v.commentId === reply.id)?.voteType,
          })),
        })),
      }

      return postWithVotes
    }

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

  // NEW: Advanced voting with duplicate prevention
  async toggleVote(
    userId: string,
    voteType: VoteType,
    options: { postId?: string; commentId?: string }
  ) {
    const { postId, commentId } = options

    if (!postId && !commentId) {
      throw new AppError(400, 'Either postId or commentId must be provided')
    }

    // Check for existing vote
    const existingVote = await prisma.forumVote.findFirst({
      where: {
        userId,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
    })

    // If user is trying to vote the same way, remove the vote (toggle off)
    if (existingVote && existingVote.voteType === voteType) {
      await prisma.forumVote.delete({
        where: { id: existingVote.id },
      })

      // Decrement count
      if (postId) {
        await prisma.forumPost.update({
          where: { id: postId },
          data: {
            [voteType === 'UP' ? 'upvotes' : 'downvotes']: {
              decrement: 1,
            },
          },
        })
      } else if (commentId) {
        await prisma.forumComment.update({
          where: { id: commentId },
          data: {
            [voteType === 'UP' ? 'upvotes' : 'downvotes']: {
              decrement: 1,
            },
          },
        })
      }

      return { action: 'removed', voteType }
    }

    // If user has opposite vote, update it
    if (existingVote && existingVote.voteType !== voteType) {
      await prisma.forumVote.update({
        where: { id: existingVote.id },
        data: { voteType },
      })

      // Decrement old count, increment new count
      if (postId) {
        await prisma.forumPost.update({
          where: { id: postId },
          data: {
            [existingVote.voteType === 'UP' ? 'upvotes' : 'downvotes']: {
              decrement: 1,
            },
            [voteType === 'UP' ? 'upvotes' : 'downvotes']: {
              increment: 1,
            },
          },
        })
      } else if (commentId) {
        await prisma.forumComment.update({
          where: { id: commentId },
          data: {
            [existingVote.voteType === 'UP' ? 'upvotes' : 'downvotes']: {
              decrement: 1,
            },
            [voteType === 'UP' ? 'upvotes' : 'downvotes']: {
              increment: 1,
            },
          },
        })
      }

      return { action: 'changed', voteType }
    }

    // Create new vote
    await prisma.forumVote.create({
      data: {
        userId,
        voteType,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
    })

    // Increment count
    if (postId) {
      await prisma.forumPost.update({
        where: { id: postId },
        data: {
          [voteType === 'UP' ? 'upvotes' : 'downvotes']: {
            increment: 1,
          },
        },
      })

      // Award points to post author (only for upvotes)
      if (voteType === 'UP') {
        const post = await prisma.forumPost.findUnique({
          where: { id: postId },
          select: { authorId: true },
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
    } else if (commentId) {
      await prisma.forumComment.update({
        where: { id: commentId },
        data: {
          [voteType === 'UP' ? 'upvotes' : 'downvotes']: {
            increment: 1,
          },
        },
      })

      // Award points to comment author (only for upvotes)
      if (voteType === 'UP') {
        const comment = await prisma.forumComment.findUnique({
          where: { id: commentId },
          select: { authorId: true },
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

    return { action: 'added', voteType }
  }

  // Mark comment as best answer (only post author can do this)
  async markBestAnswer(postId: string, commentId: string, userId: string) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      throw new AppError(404, 'Post not found')
    }

    if (post.authorId !== userId) {
      throw new AppError(403, 'Only the post author can mark best answer')
    }

    // Update post and comment
    await prisma.$transaction([
      prisma.forumPost.update({
        where: { id: postId },
        data: {
          isSolved: true,
          bestAnswerId: commentId,
        },
      }),
      prisma.forumComment.update({
        where: { id: commentId },
        data: {
          isBestAnswer: true,
        },
      }),
    ])

    // Award bonus points to comment author
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    })

    if (comment) {
      await prisma.user.update({
        where: { id: comment.authorId },
        data: {
          totalPoints: {
            increment: 10, // Bonus for best answer
          },
        },
      })
    }
  }

  // Get popular tags
  async getPopularTags(limit = 20) {
    const posts = await prisma.forumPost.findMany({
      select: { tags: true },
      where: {
        tags: {
          isEmpty: false,
        },
      },
    })

    // Count tag frequency
    const tagCounts: Record<string, number> = {}
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    // Sort and return top tags
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))
  }
}

export const forumService = new ForumService()

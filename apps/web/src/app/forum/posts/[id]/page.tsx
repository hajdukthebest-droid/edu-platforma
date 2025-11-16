'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  ArrowLeft,
  Send,
  Trash2,
  Edit,
  CheckCircle2,
  Award,
  Tag,
  CornerDownRight,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface Comment {
  id: string
  content: string
  upvotes: number
  downvotes: number
  isBestAnswer: boolean
  createdAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  userVote?: 'UP' | 'DOWN'
  replies?: Comment[]
}

export default function ForumPostPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [commentContent, setCommentContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const { data: post, isLoading } = useQuery({
    queryKey: ['forum-post', params.id],
    queryFn: async () => {
      const response = await api.get(`/forum/posts/${params.id}`)
      return response.data.data
    },
  })

  const voteMutation = useMutation({
    mutationFn: async ({
      voteType,
      postId,
      commentId,
    }: {
      voteType: 'UP' | 'DOWN'
      postId?: string
      commentId?: string
    }) => {
      await api.post('/forum/vote', { voteType, postId, commentId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', params.id] })
    },
  })

  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string; parentCommentId?: string }) => {
      await api.post(`/forum/posts/${params.id}/comments`, data)
    },
    onSuccess: () => {
      setCommentContent('')
      setReplyContent('')
      setReplyingTo(null)
      queryClient.invalidateQueries({ queryKey: ['forum-post', params.id] })
    },
  })

  const markBestAnswerMutation = useMutation({
    mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
      await api.post('/forum/mark-best-answer', { postId, commentId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', params.id] })
    },
  })

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/forum/posts/${params.id}`)
    },
    onSuccess: () => {
      router.push('/forum')
    },
  })

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentContent.trim()) {
      createCommentMutation.mutate({ content: commentContent })
    }
  }

  const handleSubmitReply = (parentCommentId: string) => {
    if (replyContent.trim()) {
      createCommentMutation.mutate({
        content: replyContent,
        parentCommentId,
      })
    }
  }

  const canDeletePost =
    user &&
    (user.id === post?.author.id || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')

  const isPostAuthor = user && post && user.id === post.author.id

  const VoteButtons = ({
    votes,
    onVote,
    userVote,
    disabled,
  }: {
    votes: { up: number; down: number }
    onVote: (type: 'UP' | 'DOWN') => void
    userVote?: 'UP' | 'DOWN'
    disabled?: boolean
  }) => (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onVote('UP')}
        disabled={disabled}
        className={`p-1 rounded transition-colors ${
          userVote === 'UP'
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <ThumbsUp className="h-5 w-5" />
      </button>
      <span className="font-medium text-sm">{votes.up - votes.down}</span>
      <button
        onClick={() => onVote('DOWN')}
        disabled={disabled}
        className={`p-1 rounded transition-colors ${
          userVote === 'DOWN'
            ? 'text-red-600 bg-red-50'
            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <ThumbsDown className="h-5 w-5" />
      </button>
    </div>
  )

  const CommentCard = ({
    comment,
    isReply = false,
  }: {
    comment: Comment
    isReply?: boolean
  }) => (
    <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
      <Card className={comment.isBestAnswer ? 'border-2 border-green-500' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <VoteButtons
              votes={{ up: comment.upvotes, down: comment.downvotes }}
              onVote={(type) => voteMutation.mutate({ voteType: type, commentId: comment.id })}
              userVote={comment.userVote}
              disabled={!user}
            />

            <div className="flex-1">
              {comment.isBestAnswer && (
                <div className="flex items-center gap-2 mb-3 text-green-600">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold text-sm">Najbolji odgovor</span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3 text-sm">
                <span className="font-medium">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.content}</p>

              <div className="flex items-center gap-3">
                {!isReply && (
                  <button
                    onClick={() =>
                      setReplyingTo(replyingTo === comment.id ? null : comment.id)
                    }
                    disabled={!user}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <CornerDownRight className="h-3.5 w-3.5" />
                    Odgovori
                  </button>
                )}

                {isPostAuthor && !comment.isBestAnswer && !isReply && !post.isSolved && (
                  <button
                    onClick={() =>
                      markBestAnswerMutation.mutate({
                        postId: post.id,
                        commentId: comment.id,
                      })
                    }
                    className="text-sm text-green-600 hover:text-green-700 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Označi kao rješenje
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="ml-12 mt-3">
          <Card>
            <CardContent className="pt-6">
              <Textarea
                placeholder="Napišite odgovor..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-4"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                  Odustani
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim() || createCommentMutation.isPending}
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Odgovori
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post nije pronađen</h2>
          <Button asChild>
            <Link href="/forum">Povratak na forum</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/forum">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Povratak na forum
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Post */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-2 mb-4 flex-wrap">
              {post.isPinned && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                  Prikvačeno
                </span>
              )}
              {post.isSolved && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Riješeno
                </span>
              )}
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                {post.category.name}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {post.author.firstName} {post.author.lastName}
                </span>
                <span>•</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>

              {canDeletePost && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/forum/posts/${post.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Jeste li sigurni da želite izbrisati ovu temu?')) {
                        deletePostMutation.mutate()
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap text-gray-700">{post.content}</p>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <VoteButtons
                  votes={{ up: post.upvotes, down: post.downvotes }}
                  onVote={(type) =>
                    voteMutation.mutate({ voteType: type, postId: post.id })
                  }
                  userVote={post.userVote}
                  disabled={!user}
                />
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">{post.comments.length}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="h-5 w-5" />
                <span className="font-medium">{post.viewCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            Odgovori ({post.comments.length})
          </h2>

          {/* Comment Form */}
          {user ? (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitComment}>
                  <Textarea
                    placeholder="Napišite odgovor..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="mb-4"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        !commentContent.trim() || createCommentMutation.isPending
                      }
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Objavi odgovor
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600 mb-4">Prijavite se da biste odgovorili</p>
                <Button asChild>
                  <Link href="/login">Prijava</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          {post.comments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Nema odgovora. Budite prvi koji će odgovoriti!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment: Comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

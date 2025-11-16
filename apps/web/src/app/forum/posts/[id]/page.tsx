'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import { ThumbsUp, MessageSquare, Eye, ArrowLeft, Send, Trash2, Edit } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function ForumPostPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [commentContent, setCommentContent] = useState('')

  const { data: post, isLoading } = useQuery({
    queryKey: ['forum-post', params.id],
    queryFn: async () => {
      const response = await api.get(`/forum/posts/${params.id}`)
      return response.data.data
    },
  })

  const upvotePostMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/forum/posts/${params.id}/upvote`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', params.id] })
    },
  })

  const upvoteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await api.post(`/forum/comments/${commentId}/upvote`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', params.id] })
    },
  })

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post(`/forum/posts/${params.id}/comments`, { content })
    },
    onSuccess: () => {
      setCommentContent('')
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
      createCommentMutation.mutate(commentContent)
    }
  }

  const canDeletePost = user && (user.id === post?.author.id || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')

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
            <div className="flex items-start gap-2 mb-4">
              {post.isPinned && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                  Prikvačeno
                </span>
              )}
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                {post.category.name}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

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
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t">
              <button
                onClick={() => user && upvotePostMutation.mutate()}
                disabled={!user}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="font-medium">{post.upvotes}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-600">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">{post._count.comments}</span>
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
            Komentari ({post.comments.length})
          </h2>

          {/* Comment Form */}
          {user ? (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitComment}>
                  <Textarea
                    placeholder="Napišite komentar..."
                    value={commentContent}
                    onChange={e => setCommentContent(e.target.value)}
                    className="mb-4"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!commentContent.trim() || createCommentMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Objavi komentar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600 mb-4">Prijavite se da biste komentirali</p>
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
                <p className="text-gray-600">Nema komentara. Budite prvi koji će komentirati!</p>
              </CardContent>
            </Card>
          ) : (
            post.comments.map((comment: any) => (
              <Card key={comment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 text-sm">
                        <span className="font-medium">
                          {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>

                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.content}</p>

                      <button
                        onClick={() => user && upvoteCommentMutation.mutate(comment.id)}
                        disabled={!user}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.upvotes}</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

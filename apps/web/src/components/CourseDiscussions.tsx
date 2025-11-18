'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import api from '@/lib/api'
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Eye,
  CheckCircle,
  Clock,
  ChevronRight,
  Search,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { hr } from 'date-fns/locale'

interface CourseDiscussionsProps {
  courseId: string
  courseName: string
}

export function CourseDiscussions({ courseId, courseName }: CourseDiscussionsProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' })

  // Fetch course discussions
  const { data, isLoading } = useQuery({
    queryKey: ['course-discussions', courseId, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        courseId,
        ...(search && { search }),
        limit: '10',
      })
      const response = await api.get(`/forum/posts?${params}`)
      return response.data.data
    },
  })

  // Fetch forum categories for creating posts
  const { data: categories } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const response = await api.get('/forum/categories')
      return response.data.data
    },
  })

  // Create new discussion
  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; tags: string[]; categoryId: string; courseId: string }) => {
      const response = await api.post('/forum/posts', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-discussions', courseId] })
      setShowNewDialog(false)
      setNewPost({ title: '', content: '', tags: '' })
    },
  })

  const handleCreatePost = () => {
    // Find Q&A category or use first category
    const qnaCategory = categories?.find((c: any) =>
      c.name.toLowerCase().includes('q&a') || c.name.toLowerCase().includes('pitanja')
    ) || categories?.[0]

    if (!qnaCategory) {
      alert('Nema dostupnih kategorija za objavu')
      return
    }

    createMutation.mutate({
      title: newPost.title,
      content: newPost.content,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      categoryId: qnaCategory.id,
      courseId,
    })
  }

  const posts = data?.posts || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Pitanja i diskusije
            </CardTitle>
            <CardDescription>
              Pitajte instruktora ili razgovarajte s drugim polaznicima
            </CardDescription>
          </div>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo pitanje
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Postavi novo pitanje</DialogTitle>
                <DialogDescription>
                  Pitanje će biti vezano uz tečaj "{courseName}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Naslov pitanja</label>
                  <Input
                    placeholder="Kratko i jasno opišite vaše pitanje"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Opis</label>
                  <Textarea
                    placeholder="Detaljnije opišite vaše pitanje ili problem..."
                    rows={5}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Oznake (odvojene zarezom)</label>
                  <Input
                    placeholder="npr. video, lekcija-3, problem"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                  Odustani
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.title || !newPost.content || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Objava...' : 'Objavi pitanje'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pretraži pitanja..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Discussions list */}
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Učitavanje diskusija...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Još nema pitanja za ovaj tečaj</p>
            <p className="text-sm mt-1">Budite prvi koji će postaviti pitanje!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/forum/${post.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author?.avatar} />
                    <AvatarFallback>
                      {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {post.title}
                      </h4>
                      {post.isSolved && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Riješeno
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: hr
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post._count?.comments || 0} odgovora
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {post.upvotes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount || 0}
                      </span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </div>
              </Link>
            ))}

            {/* View all link */}
            {posts.length > 0 && (
              <div className="pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/forum?courseId=${courseId}`}>
                    Vidi sve diskusije
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

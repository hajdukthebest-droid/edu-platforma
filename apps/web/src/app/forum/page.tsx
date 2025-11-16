'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Plus,
  Search,
  CheckCircle2,
  Tag,
  TrendingUp,
  Clock,
  HelpCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent')
  const [filterSolved, setFilterSolved] = useState<'all' | 'solved' | 'unsolved'>('all')

  const { data: categories } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const response = await api.get('/forum/categories')
      return response.data.data
    },
  })

  const { data: popularTags } = useQuery({
    queryKey: ['forum-tags'],
    queryFn: async () => {
      const response = await api.get('/forum/tags?limit=10')
      return response.data.data
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['forum-posts', selectedCategory, searchQuery, selectedTags, sortBy, filterSolved],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','))
      if (sortBy) params.append('sortBy', sortBy)
      if (filterSolved !== 'all') {
        params.append('isSolved', filterSolved === 'solved' ? 'true' : 'false')
      }

      const response = await api.get(`/forum/posts?${params.toString()}`)
      return response.data.data
    },
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Forum & Q/A</h1>
              <p className="text-gray-600 mt-1">
                Postavi pitanje ili podijeli znanje s zajednicom
              </p>
            </div>
            <Button asChild>
              <Link href="/forum/new">
                <Plus className="h-4 w-4 mr-2" />
                Novo pitanje
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kategorije</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    Sve kategorije
                  </button>
                  {categories?.map((category: any) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <span className="text-xs text-gray-500">{category._count.posts}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Popularne oznake</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags?.map(({ tag, count }: any) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <span className="text-xs opacity-75">({count})</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search & Filters */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pretraži pitanja..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  {/* Sort By */}
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setSortBy('recent')}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1 ${
                        sortBy === 'recent' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Najnovije
                    </button>
                    <button
                      onClick={() => setSortBy('popular')}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1 ${
                        sortBy === 'popular' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      Popularno
                    </button>
                    <button
                      onClick={() => setSortBy('unanswered')}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1 ${
                        sortBy === 'unanswered' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      Neodgovorena
                    </button>
                  </div>

                  {/* Solved Filter */}
                  <div className="ml-auto flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setFilterSolved('all')}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        filterSolved === 'all' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      Sva pitanja
                    </button>
                    <button
                      onClick={() => setFilterSolved('solved')}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        filterSolved === 'solved' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      Riješena
                    </button>
                    <button
                      onClick={() => setFilterSolved('unsolved')}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        filterSolved === 'unsolved' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      Neriješena
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : !data?.posts || data.posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nema pitanja za zadane filtere</p>
                  <Button asChild className="mt-4">
                    <Link href="/forum/new">Postavi prvo pitanje</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              data.posts.map((post: any) => (
                <Card
                  key={post.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => (window.location.href = `/forum/posts/${post.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Stats */}
                      <div className="flex flex-col items-center gap-2 text-sm text-gray-600 min-w-[60px]">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post._count.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.viewCount}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2 flex-wrap">
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

                        <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
                          {post.title}
                        </h3>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                              >
                                <Tag className="h-2.5 w-2.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>
                            {post.author.firstName} {post.author.lastName}
                          </span>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

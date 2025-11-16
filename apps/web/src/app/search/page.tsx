'use client'

import { useState, useEffect, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SearchBar from '@/components/search/SearchBar'
import api from '@/lib/api'
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Star,
  Users,
  BookOpen,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'courses'
  const page = parseInt(searchParams.get('page') || '1')

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    domain: searchParams.get('domain') || '',
    level: searchParams.get('level') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
  })

  const [showFilters, setShowFilters] = useState(false)

  // Search courses
  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ['search-courses', query, page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '20',
        sortBy: filters.sortBy,
      })

      if (filters.category) params.append('category', filters.category)
      if (filters.domain) params.append('domain', filters.domain)
      if (filters.level) params.append('level', filters.level)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.rating) params.append('rating', filters.rating)

      const response = await api.get(`/search/courses?${params}`)
      return response.data.data
    },
    enabled: type === 'courses',
  })

  // Search users
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['search-users', query, page],
    queryFn: async () => {
      const response = await api.get(`/search/users?q=${encodeURIComponent(query)}&page=${page}`)
      return response.data.data
    },
    enabled: type === 'users',
  })

  // Search forum posts
  const { data: forumData, isLoading: loadingForum } = useQuery({
    queryKey: ['search-forum', query, page],
    queryFn: async () => {
      const response = await api.get(`/search/forum?q=${encodeURIComponent(query)}&page=${page}`)
      return response.data.data
    },
    enabled: type === 'forum',
  })

  // Get facets for filters
  const { data: facets } = useQuery({
    queryKey: ['search-facets', query, filters.domain],
    queryFn: async () => {
      const params = new URLSearchParams({ q: query })
      if (filters.domain) params.append('domain', filters.domain)
      const response = await api.get(`/search/facets?${params}`)
      return response.data.data
    },
    enabled: type === 'courses',
  })

  const updateFilters = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // Reset to page 1 when filtering
    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      domain: '',
      level: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sortBy: 'relevance',
    })
    router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`)
  }

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/search?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const changeType = (newType: string) => {
    const params = new URLSearchParams({ q: query, type: newType })
    router.push(`/search?${params.toString()}`)
  }

  const isLoading = loadingCourses || loadingUsers || loadingForum
  const hasActiveFilters = Object.values(filters).some((v) => v && v !== 'relevance')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Pretraži Edu Platformu</h1>
            <SearchBar variant="default" autoFocus={!query} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Type Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <Button
            variant={type === 'courses' ? 'default' : 'ghost'}
            onClick={() => changeType('courses')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Tečajevi
            {type === 'courses' && coursesData && (
              <Badge variant="secondary" className="ml-2">
                {coursesData.pagination.total}
              </Badge>
            )}
          </Button>

          <Button
            variant={type === 'users' ? 'default' : 'ghost'}
            onClick={() => changeType('users')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Instruktori
            {type === 'users' && usersData && (
              <Badge variant="secondary" className="ml-2">
                {usersData.pagination.total}
              </Badge>
            )}
          </Button>

          <Button
            variant={type === 'forum' ? 'default' : 'ghost'}
            onClick={() => changeType('forum')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Forum
            {type === 'forum' && forumData && (
              <Badge variant="secondary" className="ml-2">
                {forumData.pagination.total}
              </Badge>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Only for courses */}
          {type === 'courses' && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filteri
                    </h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Očisti
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Sort By */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sortiraj po</label>
                      <Select
                        value={filters.sortBy}
                        onValueChange={(value) => updateFilters('sortBy', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevantnost</SelectItem>
                          <SelectItem value="rating">Ocjena</SelectItem>
                          <SelectItem value="popular">Popularnost</SelectItem>
                          <SelectItem value="newest">Najnovije</SelectItem>
                          <SelectItem value="price_low">Cijena (niska)</SelectItem>
                          <SelectItem value="price_high">Cijena (visoka)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Categories */}
                    {facets && facets.categories && facets.categories.length > 0 && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Kategorija</label>
                        <Select
                          value={filters.category}
                          onValueChange={(value) => updateFilters('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sve kategorije" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sve kategorije</SelectItem>
                            {facets.categories.map((cat: any) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name} ({cat.count})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Level */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nivo</label>
                      <Select
                        value={filters.level}
                        onValueChange={(value) => updateFilters('level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Svi nivoi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Svi nivoi</SelectItem>
                          <SelectItem value="BEGINNER">Početnik</SelectItem>
                          <SelectItem value="INTERMEDIATE">Srednji</SelectItem>
                          <SelectItem value="ADVANCED">Napredan</SelectItem>
                          <SelectItem value="EXPERT">Ekspert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Minimalna ocjena</label>
                      <Select
                        value={filters.rating}
                        onValueChange={(value) => updateFilters('rating', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sve ocjene" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sve ocjene</SelectItem>
                          <SelectItem value="4.5">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              4.5+
                            </div>
                          </SelectItem>
                          <SelectItem value="4.0">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              4.0+
                            </div>
                          </SelectItem>
                          <SelectItem value="3.5">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              3.5+
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    {facets && facets.priceRanges && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Cijena</label>
                        <div className="space-y-2">
                          {facets.priceRanges.map((range: any, index: number) => (
                            <Button
                              key={index}
                              variant={
                                filters.minPrice === range.min.toString() &&
                                filters.maxPrice === range.max.toString()
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() => {
                                updateFilters('minPrice', range.min.toString())
                                updateFilters('maxPrice', range.max.toString())
                              }}
                              className="w-full justify-start text-sm"
                            >
                              {range.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className={type === 'courses' ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Courses Results */}
                {type === 'courses' && coursesData && (
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-600">
                        Pronađeno {coursesData.pagination.total} rezultata
                        {query && ` za "${query}"`}
                      </p>
                    </div>

                    {coursesData.courses.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nema rezultata</h3>
                        <p className="text-gray-600 mb-4">
                          Pokušajte s drugim ključnim riječima ili uklonite neke filtere
                        </p>
                        {hasActiveFilters && (
                          <Button onClick={clearFilters}>Očisti filtere</Button>
                        )}
                      </Card>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {coursesData.courses.map((course: any) => (
                            <Link key={course.id} href={`/courses/${course.slug}`}>
                              <Card className="hover:shadow-lg transition-shadow h-full">
                                {course.thumbnail && (
                                  <div className="relative h-48 w-full">
                                    <Image
                                      src={course.thumbnail}
                                      alt={course.title}
                                      fill
                                      className="object-cover rounded-t-lg"
                                    />
                                  </div>
                                )}
                                <CardContent className="p-4">
                                  <h3 className="font-semibold mb-2 line-clamp-2">
                                    {course.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {course.shortDescription}
                                  </p>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      {course.creator?.firstName} {course.creator?.lastName}
                                    </span>
                                    {course.averageRating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">
                                          {Number(course.averageRating).toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">
                                      {course.category?.name}
                                    </Badge>
                                    <span className="font-bold text-blue-600">
                                      {course.price > 0 ? `€${course.price}` : 'Besplatno'}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>

                        {/* Pagination */}
                        {coursesData.pagination.totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                              variant="outline"
                              onClick={() => changePage(page - 1)}
                              disabled={page === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Prethodna
                            </Button>

                            <span className="px-4 py-2 text-sm text-gray-600">
                              Stranica {page} od {coursesData.pagination.totalPages}
                            </span>

                            <Button
                              variant="outline"
                              onClick={() => changePage(page + 1)}
                              disabled={page === coursesData.pagination.totalPages}
                            >
                              Sljedeća
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Users Results */}
                {type === 'users' && usersData && (
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-600">
                        Pronađeno {usersData.pagination.total} instruktora
                        {query && ` za "${query}"`}
                      </p>
                    </div>

                    {usersData.users.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nema rezultata</h3>
                        <p className="text-gray-600">
                          Pokušajte s drugim ključnim riječima
                        </p>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {usersData.users.map((user: any) => (
                          <Link key={user.id} href={`/profile/${user.id}`}>
                            <Card className="hover:shadow-lg transition-shadow p-6">
                              <div className="flex flex-col items-center text-center">
                                {user.profilePicture ? (
                                  <Image
                                    src={user.profilePicture}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    width={80}
                                    height={80}
                                    className="rounded-full mb-3"
                                  />
                                ) : (
                                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                    <Users className="h-10 w-10 text-blue-600" />
                                  </div>
                                )}
                                <h3 className="font-semibold">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <Badge variant="outline" className="mt-2">
                                  {user.role}
                                </Badge>
                                {user.bio && (
                                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                                    {user.bio}
                                  </p>
                                )}
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Forum Results */}
                {type === 'forum' && forumData && (
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-600">
                        Pronađeno {forumData.pagination.total} forum postova
                        {query && ` za "${query}"`}
                      </p>
                    </div>

                    {forumData.posts.length === 0 ? (
                      <Card className="p-12 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nema rezultata</h3>
                        <p className="text-gray-600">
                          Pokušajte s drugim ključnim riječima
                        </p>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {forumData.posts.map((post: any) => (
                          <Link key={post.id} href={`/forum/posts/${post.id}`}>
                            <Card className="hover:shadow-lg transition-shadow p-6">
                              <h3 className="font-semibold mb-2">{post.title}</h3>
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>
                                  {post.author.firstName} {post.author.lastName}
                                </span>
                                <span>•</span>
                                <span>
                                  {new Date(post.createdAt).toLocaleDateString('hr-HR')}
                                </span>
                                <span>•</span>
                                <span>{post.viewCount} pregleda</span>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SearchResults />
    </Suspense>
  )
}

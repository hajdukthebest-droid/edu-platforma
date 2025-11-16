'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Search, X, SlidersHorizontal, Star } from 'lucide-react'

interface Course {
  id: string
  title: string
  slug: string
  shortDescription: string
  thumbnail: string | null
  level: string
  price: string
  duration: number | null
  enrollmentCount: number
  averageRating: number
  creator: {
    firstName: string | null
    lastName: string | null
  }
  category: {
    name: string
  }
}

interface FilterOptions {
  categories: Array<{ id: string; name: string; _count: { courses: number } }>
  levels: Array<{ value: string; count: number }>
  languages: string[]
  priceRange: { min: number; max: number }
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [level, setLevel] = useState<string>('')
  const [minRating, setMinRating] = useState<number | undefined>()
  const [isFree, setIsFree] = useState<boolean | undefined>()
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(true)

  // Build query params
  const queryParams = new URLSearchParams()
  if (search) queryParams.append('search', search)
  if (category) queryParams.append('category', category)
  if (level) queryParams.append('level', level)
  if (minRating !== undefined) queryParams.append('minRating', minRating.toString())
  if (isFree !== undefined) queryParams.append('isFree', isFree.toString())
  if (sortBy) queryParams.append('sortBy', sortBy)
  if (sortOrder) queryParams.append('sortOrder', sortOrder)

  const { data, isLoading, error } = useQuery({
    queryKey: ['courses', queryParams.toString()],
    queryFn: async () => {
      const response = await api.get(`/courses?${queryParams.toString()}`)
      return response.data.data
    },
  })

  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ['course-filter-options'],
    queryFn: async () => {
      const response = await api.get('/courses/filters/options')
      return response.data.data
    },
  })

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setLevel('')
    setMinRating(undefined)
    setIsFree(undefined)
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  const hasActiveFilters = search || category || level || minRating !== undefined || isFree !== undefined

  const courses = data?.courses || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Svi tečajevi</h1>
              <p className="text-gray-600 mt-2">
                Pronađite savršeni tečaj za svoje potrebe
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filteri
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Filteri</CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Očisti
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Pretraži</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Naziv tečaja..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Kategorija</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sve kategorije" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sve kategorije</SelectItem>
                      {filterOptions?.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} ({cat._count.courses})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <Label>Razina</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sve razine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sve razine</SelectItem>
                      {filterOptions?.levels.map((lvl) => (
                        <SelectItem key={lvl.value} value={lvl.value}>
                          {lvl.value === 'BEGINNER' && 'Početnik'}
                          {lvl.value === 'INTERMEDIATE' && 'Srednji'}
                          {lvl.value === 'ADVANCED' && 'Napredni'}
                          {' '}({lvl.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Minimalna ocjena</Label>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(minRating === rating ? undefined : rating)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          minRating === rating
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm">i više</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label>Cijena</Label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsFree(isFree === true ? undefined : true)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        isFree === true
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      Besplatno
                    </button>
                    <button
                      onClick={() => setIsFree(isFree === false ? undefined : false)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        isFree === false
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      Plaćeno
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {isLoading ? (
                  'Učitavanje...'
                ) : (
                  <>
                    Pronađeno <span className="font-semibold">{data?.pagination.total || 0}</span>{' '}
                    tečajeva
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Sortiraj:</Label>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split('-')
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder as 'asc' | 'desc')
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Najnovije</SelectItem>
                    <SelectItem value="createdAt-asc">Najstarije</SelectItem>
                    <SelectItem value="price-asc">Cijena: niža - viša</SelectItem>
                    <SelectItem value="price-desc">Cijena: viša - niža</SelectItem>
                    <SelectItem value="enrollmentCount-desc">Najpopularnije</SelectItem>
                    <SelectItem value="rating-desc">Najbolje ocijenjeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card>
                <CardContent className="py-12 text-center text-red-600">
                  Greška prilikom učitavanja tečajeva
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && courses.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">
                    Nema tečajeva koji odgovaraju odabranim filterima
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline">
                      Očisti filtere
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Courses Grid */}
            {!isLoading && !error && courses.length > 0 && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course: Course) => (
                  <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader>
                      {course.thumbnail && (
                        <div className="aspect-video bg-gray-200 rounded-md mb-4">
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Slika tečaja
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {course.level === 'BEGINNER' && 'Početnik'}
                          {course.level === 'INTERMEDIATE' && 'Srednji'}
                          {course.level === 'ADVANCED' && 'Napredni'}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {course.category.name}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.shortDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center gap-1 mb-2">
                        {course.averageRating > 0 ? (
                          <>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(course.averageRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              ({course.averageRating.toFixed(1)})
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Nema ocjena</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                          {course.enrollmentCount} polaznika
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {course.price === '0'
                            ? 'Besplatno'
                            : formatCurrency(parseFloat(course.price))}
                        </span>
                      </div>
                      <Button asChild className="w-full">
                        <Link href={`/courses/${course.slug}`}>Pogledaj tečaj</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

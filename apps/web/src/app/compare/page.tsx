'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import {
  GitCompare,
  Plus,
  X,
  Star,
  Clock,
  BookOpen,
  Users,
  Award,
  Video,
  FileText,
  CheckCircle,
  ArrowRight,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ComparePage() {
  const searchParams = useSearchParams()
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    searchParams.get('courses')?.split(',').filter(Boolean) || []
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Fetch selected courses
  const { data: courses } = useQuery({
    queryKey: ['compare-courses', selectedCourses],
    queryFn: async () => {
      if (selectedCourses.length === 0) return []
      const promises = selectedCourses.map(id =>
        api.get(`/courses/${id}`).then(res => res.data.data)
      )
      return Promise.all(promises)
    },
    enabled: selectedCourses.length > 0,
  })

  // Search courses
  const { data: searchResults } = useQuery({
    queryKey: ['search-courses', searchQuery],
    queryFn: async () => {
      const response = await api.get(`/courses?search=${searchQuery}&limit=5`)
      return response.data.data
    },
    enabled: searchQuery.length > 2,
  })

  const addCourse = (courseId: string) => {
    if (selectedCourses.length < 3 && !selectedCourses.includes(courseId)) {
      setSelectedCourses([...selectedCourses, courseId])
      setSearchQuery('')
      setShowSearch(false)
    }
  }

  const removeCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(id => id !== courseId))
  }

  const comparisonFields = [
    { key: 'price', label: 'Cijena', format: (v: number) => v === 0 ? 'Besplatno' : `${v.toFixed(2)}€` },
    { key: 'rating', label: 'Ocjena', format: (v: number) => `${v.toFixed(1)} ⭐` },
    { key: 'studentsCount', label: 'Broj studenata', format: (v: number) => v.toLocaleString() },
    { key: 'duration', label: 'Trajanje', format: (v: number) => `${v} sati` },
    { key: 'lessonsCount', label: 'Broj lekcija', format: (v: number) => v.toString() },
    { key: 'level', label: 'Razina', format: (v: string) => v === 'BEGINNER' ? 'Početnik' : v === 'INTERMEDIATE' ? 'Srednji' : 'Napredni' },
    { key: 'language', label: 'Jezik', format: (v: string) => v === 'hr' ? 'Hrvatski' : v },
    { key: 'certificate', label: 'Certifikat', format: (v: boolean) => v ? '✓ Da' : '✗ Ne' },
    { key: 'lifetime', label: 'Doživotni pristup', format: (v: boolean) => v ? '✓ Da' : '✗ Ne' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Usporedi tečajeve</h1>
          </div>
          <p className="text-gray-600">
            Usporedite do 3 tečaja i odaberite najbolji za vas
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Course Selection */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map((index) => {
            const course = courses?.[index]
            const courseId = selectedCourses[index]

            if (courseId && course) {
              return (
                <Card key={index} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => removeCourse(courseId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardContent className="pt-6">
                    <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-gray-200">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-white/50" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{course.rating?.toFixed(1) || 'N/A'}</span>
                      <span>•</span>
                      <span>{course.price === 0 ? 'Besplatno' : `${course.price?.toFixed(2)}€`}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <Card
                key={index}
                className={cn(
                  'border-dashed cursor-pointer hover:border-blue-400 transition-colors',
                  showSearch && index === selectedCourses.length && 'ring-2 ring-blue-400'
                )}
                onClick={() => setShowSearch(true)}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Dodaj tečaj</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Search Dialog */}
        {showSearch && selectedCourses.length < 3 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Pretraži tečajeve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Unesite naziv tečaja..."
                  className="pl-10"
                  autoFocus
                />
              </div>
              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults
                    .filter((c: any) => !selectedCourses.includes(c.id))
                    .map((course: any) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                        onClick={() => addCourse(course.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{course.title}</h4>
                            <p className="text-xs text-gray-500">
                              {course.instructor?.firstName} {course.instructor?.lastName}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
              {searchQuery.length > 2 && searchResults?.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Nema rezultata za "{searchQuery}"
                </p>
              )}
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setShowSearch(false)}>
                  Zatvori
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Table */}
        {courses && courses.length >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Usporedba</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Značajka</th>
                      {courses.map((course: any, index: number) => (
                        <th key={index} className="text-center py-3 px-4 font-medium">
                          {course.title.length > 20
                            ? course.title.substring(0, 20) + '...'
                            : course.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFields.map((field) => (
                      <tr key={field.key} className="border-b">
                        <td className="py-3 px-4 font-medium text-gray-600">
                          {field.label}
                        </td>
                        {courses.map((course: any, index: number) => {
                          const value = course[field.key]
                          const formattedValue = field.format(value ?? (field.key === 'certificate' || field.key === 'lifetime' ? true : 0))

                          // Highlight best value
                          let isBest = false
                          if (courses.length > 1) {
                            if (field.key === 'price') {
                              isBest = course.price === Math.min(...courses.map((c: any) => c.price || 0))
                            } else if (field.key === 'rating') {
                              isBest = course.rating === Math.max(...courses.map((c: any) => c.rating || 0))
                            } else if (field.key === 'lessonsCount' || field.key === 'duration') {
                              isBest = course[field.key] === Math.max(...courses.map((c: any) => c[field.key] || 0))
                            }
                          }

                          return (
                            <td
                              key={index}
                              className={cn(
                                'text-center py-3 px-4',
                                isBest && 'font-semibold text-green-600'
                              )}
                            >
                              {formattedValue}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                    <tr>
                      <td className="py-4 px-4"></td>
                      {courses.map((course: any, index: number) => (
                        <td key={index} className="text-center py-4 px-4">
                          <Button asChild>
                            <Link href={`/courses/${course.slug}`}>
                              Pogledaj
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {(!courses || courses.length < 2) && (
          <Card className="text-center">
            <CardContent className="py-12">
              <GitCompare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Odaberite tečajeve za usporedbu
              </h3>
              <p className="text-gray-500 mb-6">
                Dodajte najmanje 2 tečaja da biste vidjeli usporedbu
              </p>
              <Button onClick={() => setShowSearch(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj tečaj
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Trebate pomoć pri odabiru?{' '}
            <Link href="/help/contact" className="text-blue-600 hover:underline">
              Kontaktirajte nas
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

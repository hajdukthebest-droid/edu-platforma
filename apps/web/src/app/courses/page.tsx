'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

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
  averageRating: number | null
  creator: {
    firstName: string | null
    lastName: string | null
  }
}

export default function CoursesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get('/courses')
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje tečajeva...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Greška prilikom učitavanja tečajeva</p>
        </div>
      </div>
    )
  }

  const courses = data?.courses || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Svi tečajevi</h1>
          <p className="text-gray-600 mt-2">
            Pronađite savršeni tečaj za svoje potrebe
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Trenutno nema dostupnih tečajeva</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: Course) => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  {course.thumbnail && (
                    <div className="aspect-video bg-gray-200 rounded-md mb-4">
                      {/* Placeholder for thumbnail */}
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Slika tečaja
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {course.level}
                    </span>
                    {course.duration && (
                      <span className="text-xs text-gray-600">
                        {Math.floor(course.duration / 60)}h {course.duration % 60}min
                      </span>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.shortDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      {course.enrollmentCount} polaznika
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {course.price === '0' ? 'Besplatno' : formatCurrency(parseFloat(course.price))}
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
  )
}

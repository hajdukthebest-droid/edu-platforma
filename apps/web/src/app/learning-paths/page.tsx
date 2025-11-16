'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { BookOpen, Clock, GraduationCap, Users } from 'lucide-react'

interface LearningPath {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string | null
  level: string | null
  estimatedHours: number | null
  creator: {
    firstName: string
    lastName: string
  }
  courses: Array<{
    course: {
      id: string
      title: string
      thumbnail: string | null
    }
  }>
  _count: {
    userPaths: number
  }
}

export default function LearningPathsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const response = await api.get('/learning-paths')
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const learningPaths = data?.learningPaths || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Putanje učenja</h1>
            <p className="text-xl text-purple-100">
              Strukturirani programi učenja s nizom povezanih tečajeva za sveobuhvatno obrazovanje
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {learningPaths.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Trenutno nema dostupnih putanja učenja</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path: LearningPath) => (
              <Card key={path.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  {path.thumbnail && (
                    <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 rounded-md mb-4 flex items-center justify-center">
                      <GraduationCap className="h-16 w-16 text-white/80" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {path.level && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {path.level === 'BEGINNER' && 'Početnik'}
                        {path.level === 'INTERMEDIATE' && 'Srednji'}
                        {path.level === 'ADVANCED' && 'Napredni'}
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {path.courses.length} {path.courses.length === 1 ? 'tečaj' : 'tečajeva'}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{path.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {path.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="space-y-3 mb-4">
                    {path.estimatedHours && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>~{path.estimatedHours}h ukupno</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{path._count.userPaths} polaznika</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {path.creator.firstName} {path.creator.lastName}
                      </span>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/learning-paths/${path.slug}`}>Pregledaj putanju</Link>
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

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  FileText,
  Video,
  ListChecks,
  MessageSquare,
  Code,
  BookOpen,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const categoryColors = {
  INTRODUCTION: 'bg-blue-100 text-blue-700',
  THEORY: 'bg-purple-100 text-purple-700',
  PRACTICAL: 'bg-green-100 text-green-700',
  ASSESSMENT: 'bg-orange-100 text-orange-700',
  DISCUSSION: 'bg-yellow-100 text-yellow-700',
  PROJECT: 'bg-red-100 text-red-700',
}

const lessonTypeIcons: any = {
  VIDEO: Video,
  ARTICLE: FileText,
  QUIZ: ListChecks,
  ASSIGNMENT: Code,
  LIVE_SESSION: MessageSquare,
  INTERACTIVE: BookOpen,
}

export default function TemplatesPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedType, setSelectedType] = useState<string | undefined>()

  const { data: templates, isLoading } = useQuery({
    queryKey: ['content-templates', selectedCategory, selectedType],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedType) params.append('lessonType', selectedType)

      const response = await api.get(`/course-builder/templates?${params.toString()}`)
      return response.data.data
    },
  })

  const isInstructor = user && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN')

  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Pristup odbijen</h2>
            <p className="text-gray-600 mb-6">
              Samo instruktori mogu pristupiti template biblioteci.
            </p>
            <Button asChild>
              <Link href="/">Povratak</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/instructor/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Povratak
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Content Templates
            </h1>
            <p className="text-gray-600 mt-1">
              Predlošci za brže kreiranje lekcija
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-6">
            <div>
              <p className="text-sm font-medium mb-2">Kategorija:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedCategory ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  Sve
                </Button>
                {Object.keys(categoryColors).map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !templates || templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nema predložaka za odabrani filter</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template: any) => {
              const Icon = lessonTypeIcons[template.lessonType] || FileText
              const categoryClass =
                categoryColors[template.category as keyof typeof categoryColors]

              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={categoryClass}>{template.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <TrendingUp className="h-3 w-3" />
                        {template.usageCount}
                      </div>
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                      {template.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.lessonType}</Badge>
                      <Button size="sm" asChild>
                        <Link href={`/instructor/course-builder/templates/${template.id}`}>
                          Koristi
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

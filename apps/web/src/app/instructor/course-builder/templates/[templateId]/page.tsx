'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import {
  ArrowLeft,
  FileText,
  Video,
  ListChecks,
  Code,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Save,
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

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [courseId, setCourseId] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ['content-template', params.templateId],
    queryFn: async () => {
      const response = await api.get(`/course-builder/templates/${params.templateId}`)
      return response.data.data
    },
  })

  const { data: courses } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      const response = await api.get('/instructor/courses')
      return response.data.data
    },
  })

  const { data: modules } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      if (!courseId) return []
      const response = await api.get(`/courses/${courseId}`)
      return response.data.data.modules || []
    },
    enabled: !!courseId,
  })

  const createLessonMutation = useMutation({
    mutationFn: async () => {
      await api.post('/course-builder/lessons/from-template', {
        moduleId,
        templateId: params.templateId,
        title,
        description,
      })
    },
    onSuccess: () => {
      router.push(`/instructor/courses/${courseId}/builder`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (moduleId && title.trim()) {
      createLessonMutation.mutate()
    }
  }

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

  if (templateLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Template nije pronađen</h2>
          <Button asChild>
            <Link href="/instructor/course-builder/templates">Povratak</Link>
          </Button>
        </div>
      </div>
    )
  }

  const Icon = lessonTypeIcons[template.lessonType] || FileText
  const categoryClass =
    categoryColors[template.category as keyof typeof categoryColors]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/instructor/course-builder/templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na templates
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={categoryClass}>{template.category}</Badge>
                <Badge variant="outline">{template.lessonType}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <TrendingUp className="h-3 w-3" />
                  {template.usageCount} korištenja
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
              {template.description && (
                <p className="text-gray-600">{template.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Template Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Struktura template-a</CardTitle>
              </CardHeader>
              <CardContent>
                {template.contentStructure && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(template.contentStructure, null, 2)}
                    </pre>
                  </div>
                )}

                {template.thumbnail && (
                  <div className="mt-4">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">
                    Što sadrži ovaj template:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Tip lekcije: {template.lessonType}</li>
                    <li>• Kategorija: {template.category}</li>
                    {template.contentStructure?.sections && (
                      <li>• {template.contentStructure.sections.length} sekcija</li>
                    )}
                    {template.contentStructure?.estimatedDuration && (
                      <li>• Procijenjeno trajanje: {template.contentStructure.estimatedDuration} min</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Lesson Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Kreiraj lekciju iz template-a</CardTitle>
                <p className="text-sm text-gray-600">
                  Odaberi tečaj i modul gdje želiš kreirati novu lekciju koristeći ovaj template
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Course Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="course">Tečaj *</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger id="course">
                        <SelectValue placeholder="Odaberi tečaj" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses?.map((course: any) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Module Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="module">Modul *</Label>
                    <Select
                      value={moduleId}
                      onValueChange={setModuleId}
                      disabled={!courseId}
                    >
                      <SelectTrigger id="module">
                        <SelectValue
                          placeholder={
                            !courseId ? 'Prvo odaberi tečaj' : 'Odaberi modul'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {modules?.map((module: any, index: number) => (
                          <SelectItem key={module.id} value={module.id}>
                            Modul {index + 1}: {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Naslov lekcije *</Label>
                    <Input
                      id="title"
                      placeholder="Npr. Uvod u farmakologiju"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Opis lekcije{' '}
                      <span className="text-gray-400 font-normal">opcionalno</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Kratak opis lekcije..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Napomena:</strong> Lekcija će biti kreirana kao draft sa predefiniranom
                      strukturom iz template-a. Nakon kreiranja moći ćeš je uređivati i
                      prilagoditi prema potrebama.
                    </p>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.back()}
                    >
                      Odustani
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={
                        !moduleId ||
                        !title.trim() ||
                        createLessonMutation.isPending
                      }
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createLessonMutation.isPending ? 'Kreiram...' : 'Kreiraj lekciju'}
                    </Button>
                  </div>

                  {createLessonMutation.isError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      Došlo je do greške prilikom kreiranja lekcije. Pokušajte ponovo.
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  ArrowLeft,
  GripVertical,
  Plus,
  Copy,
  Trash2,
  Move,
  FileText,
  Video,
  ListChecks,
  Code,
  MessageSquare,
  BookOpen,
  Save,
  Download,
  Eye,
  Clock,
  Users,
  BarChart2,
  CheckSquare,
  Square,
  Loader2,
  Play,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const lessonTypeIcons: any = {
  VIDEO: Video,
  ARTICLE: FileText,
  QUIZ: ListChecks,
  ASSIGNMENT: Code,
  LIVE_SESSION: MessageSquare,
  INTERACTIVE: BookOpen,
}

export default function CourseBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [draggedModule, setDraggedModule] = useState<any>(null)
  const [draggedLesson, setDraggedLesson] = useState<any>(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [targetModuleId, setTargetModuleId] = useState<string>('')
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set())
  const [previewLesson, setPreviewLesson] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Fetch course with modules and lessons
  const { data: course, isLoading } = useQuery({
    queryKey: ['course-builder', params.courseId],
    queryFn: async () => {
      const response = await api.get(`/courses/${params.courseId}`)
      return response.data.data
    },
  })

  // Reorder modules mutation
  const reorderModulesMutation = useMutation({
    mutationFn: async (moduleOrders: { moduleId: string; orderIndex: number }[]) => {
      await api.post('/course-builder/modules/reorder', {
        courseId: params.courseId,
        moduleOrders,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-builder', params.courseId] })
    },
  })

  // Duplicate module mutation
  const duplicateModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      await api.post(`/course-builder/modules/${moduleId}/duplicate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-builder', params.courseId] })
    },
  })

  // Reorder lessons mutation
  const reorderLessonsMutation = useMutation({
    mutationFn: async ({
      moduleId,
      lessonOrders,
    }: {
      moduleId: string
      lessonOrders: { lessonId: string; orderIndex: number }[]
    }) => {
      await api.post('/course-builder/lessons/reorder', {
        moduleId,
        lessonOrders,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-builder', params.courseId] })
    },
  })

  // Duplicate lesson mutation
  const duplicateLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      await api.post(`/course-builder/lessons/${lessonId}/duplicate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-builder', params.courseId] })
    },
  })

  // Move lesson mutation
  const moveLessonMutation = useMutation({
    mutationFn: async ({
      lessonId,
      targetModuleId,
      newOrderIndex,
    }: {
      lessonId: string
      targetModuleId: string
      newOrderIndex: number
    }) => {
      await api.post(`/course-builder/lessons/${lessonId}/move`, {
        targetModuleId,
        newOrderIndex,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-builder', params.courseId] })
      setMoveDialogOpen(false)
      setSelectedLesson(null)
      setTargetModuleId('')
    },
  })

  // Export course mutation
  const exportCourseMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/course-builder/courses/${params.courseId}/export`)
      return response.data.data
    },
    onSuccess: (data) => {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${course?.slug || 'course'}-export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })

  // Delete lessons mutation
  const deleteLessonsMutation = useMutation({
    mutationFn: async (lessonIds: string[]) => {
      await Promise.all(
        lessonIds.map((id) => api.delete(`/course-builder/lessons/${id}`))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-builder', params.courseId] })
      setSelectedLessons(new Set())
    },
  })

  // Toggle lesson selection
  const toggleLessonSelection = (lessonId: string) => {
    const newSelected = new Set(selectedLessons)
    if (newSelected.has(lessonId)) {
      newSelected.delete(lessonId)
    } else {
      newSelected.add(lessonId)
    }
    setSelectedLessons(newSelected)
  }

  // Select all lessons in a module
  const toggleModuleSelection = (module: any) => {
    const moduleLessonIds = module.lessons?.map((l: any) => l.id) || []
    const allSelected = moduleLessonIds.every((id: string) => selectedLessons.has(id))

    const newSelected = new Set(selectedLessons)
    if (allSelected) {
      moduleLessonIds.forEach((id: string) => newSelected.delete(id))
    } else {
      moduleLessonIds.forEach((id: string) => newSelected.add(id))
    }
    setSelectedLessons(newSelected)
  }

  // Calculate course stats
  const courseStats = {
    totalModules: course?.modules?.length || 0,
    totalLessons: course?.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0,
    videoLessons: course?.modules?.reduce((acc: number, m: any) =>
      acc + (m.lessons?.filter((l: any) => l.type === 'VIDEO').length || 0), 0) || 0,
    quizzes: course?.modules?.reduce((acc: number, m: any) =>
      acc + (m.lessons?.filter((l: any) => l.type === 'QUIZ').length || 0), 0) || 0,
    estimatedDuration: course?.modules?.reduce((acc: number, m: any) =>
      acc + (m.lessons?.reduce((sum: number, l: any) => sum + (l.duration || 10), 0) || 0), 0) || 0,
  }

  // Module drag handlers
  const handleModuleDragStart = (module: any) => {
    setDraggedModule(module)
  }

  const handleModuleDragOver = (e: React.DragEvent, module: any) => {
    e.preventDefault()
    if (draggedModule && draggedModule.id !== module.id) {
      const modules = [...(course?.modules || [])]
      const draggedIndex = modules.findIndex((m) => m.id === draggedModule.id)
      const targetIndex = modules.findIndex((m) => m.id === module.id)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        modules.splice(draggedIndex, 1)
        modules.splice(targetIndex, 0, draggedModule)

        const moduleOrders = modules.map((m, index) => ({
          moduleId: m.id,
          orderIndex: index,
        }))

        reorderModulesMutation.mutate(moduleOrders)
      }
    }
  }

  const handleModuleDragEnd = () => {
    setDraggedModule(null)
  }

  // Lesson drag handlers
  const handleLessonDragStart = (lesson: any) => {
    setDraggedLesson(lesson)
  }

  const handleLessonDragOver = (e: React.DragEvent, lesson: any, moduleId: string) => {
    e.preventDefault()
    if (draggedLesson && draggedLesson.id !== lesson.id) {
      const module = course?.modules.find((m: any) => m.id === moduleId)
      if (!module) return

      const lessons = [...(module.lessons || [])]
      const draggedIndex = lessons.findIndex((l) => l.id === draggedLesson.id)
      const targetIndex = lessons.findIndex((l) => l.id === lesson.id)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        lessons.splice(draggedIndex, 1)
        lessons.splice(targetIndex, 0, draggedLesson)

        const lessonOrders = lessons.map((l, index) => ({
          lessonId: l.id,
          orderIndex: index,
        }))

        reorderLessonsMutation.mutate({ moduleId, lessonOrders })
      }
    }
  }

  const handleLessonDragEnd = () => {
    setDraggedLesson(null)
  }

  // Move lesson handler
  const handleMoveLesson = () => {
    if (selectedLesson && targetModuleId) {
      const targetModule = course?.modules.find((m: any) => m.id === targetModuleId)
      const newOrderIndex = targetModule?.lessons?.length || 0

      moveLessonMutation.mutate({
        lessonId: selectedLesson.id,
        targetModuleId,
        newOrderIndex,
      })
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
              Samo instruktori mogu koristiti course builder.
            </p>
            <Button asChild>
              <Link href="/">Povratak</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tečaj nije pronađen</h2>
          <Button asChild>
            <Link href="/instructor/courses">Povratak</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild size="sm">
                <Link href="/instructor/courses">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Natrag na tečajeve
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-sm text-gray-600">Course Builder</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/instructor/course-builder/templates">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Templates
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCourseMutation.mutate()}
                disabled={exportCourseMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href={`/courses/${course.slug}`}>
                  Pregled tečaja
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Course Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{courseStats.totalModules}</div>
                  <div className="text-xs text-gray-500">Modula</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xl font-bold">{courseStats.totalLessons}</div>
                  <div className="text-xs text-gray-500">Lekcija</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-xl font-bold">{courseStats.videoLessons}</div>
                  <div className="text-xs text-gray-500">Video</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-xl font-bold">{courseStats.quizzes}</div>
                  <div className="text-xs text-gray-500">Kvizova</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="text-xl font-bold">{Math.round(courseStats.estimatedDuration / 60)}h</div>
                  <div className="text-xs text-gray-500">Trajanje</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Bar */}
        {selectedLessons.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedLessons.size} lekcija odabrano
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLessons(new Set())}
              >
                Poništi odabir
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`Jeste li sigurni da želite obrisati ${selectedLessons.size} lekcija?`)) {
                    deleteLessonsMutation.mutate(Array.from(selectedLessons))
                  }
                }}
                disabled={deleteLessonsMutation.isPending}
              >
                {deleteLessonsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Obriši odabrane
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {course.modules?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nema modula</h3>
                <p className="text-gray-600 mb-4">
                  Počni graditi svoj tečaj dodavanjem prvog modula
                </p>
                <Button asChild>
                  <Link href={`/instructor/courses/${params.courseId}/modules/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj modul
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            course.modules?.map((module: any, moduleIndex: number) => (
              <Card
                key={module.id}
                draggable
                onDragStart={() => handleModuleDragStart(module)}
                onDragOver={(e) => handleModuleDragOver(e, module)}
                onDragEnd={handleModuleDragEnd}
                className={`transition-all ${
                  draggedModule?.id === module.id ? 'opacity-50' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Modul {moduleIndex + 1}</Badge>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateModuleMutation.mutate(module.id)}
                            disabled={duplicateModuleMutation.isPending}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/instructor/courses/${params.courseId}/modules/${module.id}/edit`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      {module.description && (
                        <p className="text-sm text-gray-600">{module.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Lessons */}
                  <div className="space-y-2">
                    {module.lessons?.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-3">Nema lekcija u modulu</p>
                        <Button size="sm" asChild variant="outline">
                          <Link
                            href={`/instructor/courses/${params.courseId}/modules/${module.id}/lessons/new`}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj lekciju
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      module.lessons?.map((lesson: any, lessonIndex: number) => {
                        const Icon = lessonTypeIcons[lesson.type] || FileText
                        const isSelected = selectedLessons.has(lesson.id)
                        return (
                          <div
                            key={lesson.id}
                            draggable
                            onDragStart={() => handleLessonDragStart(lesson)}
                            onDragOver={(e) => handleLessonDragOver(e, lesson, module.id)}
                            onDragEnd={handleLessonDragEnd}
                            className={`flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-all ${
                              draggedLesson?.id === lesson.id ? 'opacity-50' : ''
                            } ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}
                          >
                            <button
                              onClick={() => toggleLessonSelection(lesson.id)}
                              className="flex-shrink-0"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <Icon className="h-4 w-4 text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                                {lesson.isDraft && (
                                  <Badge variant="secondary" className="text-xs">
                                    Draft
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {lesson.type}
                                </Badge>
                                {lesson.duration && (
                                  <span className="text-xs text-gray-500">
                                    {lesson.duration} min
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPreviewLesson(lesson)
                                  setShowPreview(true)
                                }}
                                title="Pregled"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLesson(lesson)
                                  setMoveDialogOpen(true)
                                }}
                              >
                                <Move className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateLessonMutation.mutate(lesson.id)}
                                disabled={duplicateLessonMutation.isPending}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link
                                  href={`/instructor/courses/${params.courseId}/modules/${module.id}/lessons/${lesson.id}/edit`}
                                >
                                  <FileText className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Add lesson button */}
                  {module.lessons?.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      asChild
                    >
                      <Link
                        href={`/instructor/courses/${params.courseId}/modules/${module.id}/lessons/new`}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj lekciju
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          {/* Add module button */}
          {course.modules?.length > 0 && (
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/instructor/courses/${params.courseId}/modules/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj modul
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Move Lesson Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Premjesti lekciju</DialogTitle>
            <DialogDescription>
              Odaberi modul u koji želiš premjestiti lekciju &quot;{selectedLesson?.title}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ciljni modul</label>
              <Select value={targetModuleId} onValueChange={setTargetModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Odaberi modul" />
                </SelectTrigger>
                <SelectContent>
                  {course?.modules
                    ?.filter((m: any) => m.id !== selectedLesson?.moduleId)
                    .map((module: any) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
              Odustani
            </Button>
            <Button
              onClick={handleMoveLesson}
              disabled={!targetModuleId || moveLessonMutation.isPending}
            >
              <Move className="h-4 w-4 mr-2" />
              Premjesti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Lesson Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewLesson && (() => {
                const Icon = lessonTypeIcons[previewLesson.type] || FileText
                return <Icon className="h-5 w-5" />
              })()}
              {previewLesson?.title}
            </DialogTitle>
            <DialogDescription>
              Pregled sadržaja lekcije
            </DialogDescription>
          </DialogHeader>

          {previewLesson && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Badge variant="outline">{previewLesson.type}</Badge>
                {previewLesson.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {previewLesson.duration} min
                  </span>
                )}
                {previewLesson.pointsReward && (
                  <span>{previewLesson.pointsReward} bodova</span>
                )}
              </div>

              {previewLesson.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Opis</h4>
                  <p className="text-sm text-gray-600">{previewLesson.description}</p>
                </div>
              )}

              {previewLesson.type === 'VIDEO' && previewLesson.videoUrl && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Video</h4>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 break-all">{previewLesson.videoUrl}</p>
                  </div>
                </div>
              )}

              {previewLesson.type === 'ARTICLE' && previewLesson.content && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Sadržaj</h4>
                  <div className="prose prose-sm max-h-60 overflow-y-auto border rounded p-4">
                    <div dangerouslySetInnerHTML={{ __html: previewLesson.content.substring(0, 500) + '...' }} />
                  </div>
                </div>
              )}

              {previewLesson.attachments && previewLesson.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Prilozi ({previewLesson.attachments.length})</h4>
                  <div className="space-y-1">
                    {previewLesson.attachments.map((url: string, i: number) => (
                      <div key={i} className="text-xs text-gray-500 truncate">
                        {url}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Zatvori
            </Button>
            <Button asChild>
              <Link
                href={`/instructor/courses/${params.courseId}/modules/${previewLesson?.moduleId}/lessons/${previewLesson?.id}/edit`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Uredi lekciju
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

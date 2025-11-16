'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import VideoPlayer from '@/components/video/VideoPlayer'
import api from '@/lib/api'
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Lesson {
  id: string
  title: string
  description: string
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT'
  content: string
  videoUrl: string | null
  videoProvider: 'youtube' | 'vimeo' | 'self-hosted' | null
  videoDuration: number | null
  attachments: string[]
  isPreview: boolean
  isMandatory: boolean
  pointsReward: number
  module: {
    id: string
    title: string
    courseId: string
  }
  course: {
    id: string
    title: string
    slug: string
  }
}

interface LessonProgress {
  id: string
  lessonId: string
  isCompleted: boolean
  completedAt: string | null
  timeSpent: number
  lastPosition: number | null
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>
}) {
  const { slug, lessonId } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showCompletionCongrats, setShowCompletionCongrats] = useState(false)

  // Fetch lesson data
  const { data: lesson, isLoading } = useQuery<Lesson>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const response = await api.get(`/courses/${slug}/lessons/${lessonId}`)
      return response.data.data
    },
  })

  // Fetch lesson progress
  const { data: progress } = useQuery<LessonProgress>({
    queryKey: ['lesson-progress', lessonId],
    queryFn: async () => {
      const response = await api.get(`/progress/lessons/${lessonId}`)
      return response.data.data
    },
  })

  // Mark lesson as complete mutation
  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/progress/lessons/${lessonId}/complete`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['course-progress'] })
      setShowCompletionCongrats(true)

      setTimeout(() => {
        setShowCompletionCongrats(false)
      }, 5000)
    },
  })

  const handleVideoComplete = () => {
    if (!progress?.isCompleted) {
      completeLessonMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Lekcija nije pronađena</h1>
          <Link href={`/courses/${slug}`}>
            <Button>Vrati se na tečaj</Button>
          </Link>
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
              <Link href={`/courses/${slug}`}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Natrag na tečaj
                </Button>
              </Link>
              <div>
                <p className="text-sm text-gray-600">{lesson.course.title}</p>
                <h1 className="text-xl font-bold">{lesson.title}</h1>
              </div>
            </div>

            {progress?.isCompleted ? (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="h-4 w-4 mr-1" />
                Završeno
              </Badge>
            ) : (
              <Button
                onClick={() => completeLessonMutation.mutate()}
                disabled={completeLessonMutation.isPending}
              >
                {completeLessonMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Označavam...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Označi kao završeno
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Completion Congratulations */}
            {showCompletionCongrats && (
              <Card className="mb-6 bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-bold text-green-900">
                        Čestitamo! Lekcija završena! 🎉
                      </h3>
                      <p className="text-sm text-green-700">
                        Zaradili ste {lesson.pointsReward} bodova!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Player */}
            {lesson.type === 'VIDEO' && lesson.videoUrl && (
              <Card className="mb-6">
                <CardContent className="p-0">
                  <VideoPlayer
                    lessonId={lesson.id}
                    videoUrl={lesson.videoUrl}
                    videoProvider={lesson.videoProvider || 'self-hosted'}
                    initialPosition={progress?.lastPosition || 0}
                    onComplete={handleVideoComplete}
                  />
                </CardContent>
              </Card>
            )}

            {/* Article Content */}
            {lesson.type === 'ARTICLE' && (
              <Card className="mb-6">
                <CardContent className="p-8 prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </CardContent>
              </Card>
            )}

            {/* Lesson Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  O lekciji
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{lesson.description}</p>

                {/* Attachments */}
                {lesson.attachments && lesson.attachments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Prilozi
                    </h3>
                    <div className="space-y-2">
                      {lesson.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Attachment {index + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Progress Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Tvoj napredak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {progress?.isCompleted ? (
                    <Badge className="bg-green-100 text-green-700">Završeno</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700">U tijeku</Badge>
                  )}
                </div>

                {progress?.timeSpent && progress.timeSpent > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Potrošeno vrijeme
                    </span>
                    <span className="text-sm font-semibold">
                      {Math.floor(progress.timeSpent / 60)} min
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bodovi</span>
                  <span className="text-sm font-semibold">
                    {lesson.pointsReward} bodova
                  </span>
                </div>

                {progress?.completedAt && (
                  <div className="pt-4 border-t text-xs text-gray-500">
                    Završeno:{' '}
                    {new Date(progress.completedAt).toLocaleDateString('hr-HR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informacije</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tip lekcije</span>
                  <Badge variant="outline">{lesson.type}</Badge>
                </div>

                {lesson.videoDuration && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trajanje</span>
                    <span className="font-semibold">
                      {Math.floor(lesson.videoDuration / 60)} min
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Modul</span>
                  <span className="font-semibold">{lesson.module.title}</span>
                </div>

                {lesson.isPreview && (
                  <div className="pt-3 border-t">
                    <Badge className="bg-purple-100 text-purple-700">
                      Besplatni pregled
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

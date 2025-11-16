'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Bookmark, Trash2, BookOpen, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function BookmarksPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: bookmarksData, isLoading } = useQuery({
    queryKey: ['user-bookmarks'],
    queryFn: async () => {
      const response = await api.get('/bookmarks')
      return response.data.data
    },
    enabled: !!user,
  })

  const deleteBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId: string) => {
      await api.delete(`/bookmarks/${bookmarkId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] })
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-gray-600 mb-6">
              Morate biti prijavljeni da biste vidjeli svoje oznake.
            </p>
            <Button asChild>
              <Link href="/login">Prijava</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const bookmarks = bookmarksData?.bookmarks || []

  // Group bookmarks by course
  const bookmarksByCourse = bookmarks.reduce((acc: any, bookmark: any) => {
    const courseId = bookmark.lesson.module.course.id
    const courseTitle = bookmark.lesson.module.course.title

    if (!acc[courseId]) {
      acc[courseId] = {
        courseTitle,
        courseSlug: bookmark.lesson.module.course.slug,
        bookmarks: [],
      }
    }

    acc[courseId].bookmarks.push(bookmark)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">Moje oznake</h1>
            <p className="text-xl text-purple-100">
              Brz pristup vašim omiljenim lekcijama
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {bookmarks.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nemate oznaka</h3>
              <p className="text-gray-600 mb-6">
                Označite lekcije tijekom učenja da biste im se kasnije lakše vratili.
              </p>
              <Button asChild>
                <Link href="/courses">Pregledaj kurseve</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(bookmarksByCourse).map(([courseId, data]: any) => (
              <Card key={courseId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{data.courseTitle}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {data.bookmarks.length} označenih lekcija
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/courses/${data.courseSlug}`}>
                        Otvori kurs
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.bookmarks
                      .sort((a: any, b: any) => {
                        const moduleCompare =
                          a.lesson.module.orderIndex - b.lesson.module.orderIndex
                        if (moduleCompare !== 0) return moduleCompare
                        return a.lesson.orderIndex - b.lesson.orderIndex
                      })
                      .map((bookmark: any) => (
                        <div
                          key={bookmark.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">
                                  Modul {bookmark.lesson.module.orderIndex + 1}:{' '}
                                  {bookmark.lesson.module.title}
                                </span>
                              </div>
                              <h4 className="text-lg font-semibold mb-2">
                                {bookmark.lesson.orderIndex + 1}. {bookmark.lesson.title}
                              </h4>
                              {bookmark.note && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {bookmark.note}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Označeno {formatDate(bookmark.createdAt)}</span>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                                  {bookmark.lesson.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (
                                    confirm('Jeste li sigurni da želite ukloniti ovu oznaku?')
                                  ) {
                                    deleteBookmarkMutation.mutate(bookmark.id)
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

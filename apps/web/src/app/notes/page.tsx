'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { BookOpen, Trash2, Edit, Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function NotesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editingNote, setEditingNote] = useState<any>(null)

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['user-notes'],
    queryFn: async () => {
      const response = await api.get('/notes')
      return response.data.data
    },
    enabled: !!user,
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/notes/${noteId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notes'] })
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-gray-600 mb-6">
              Morate biti prijavljeni da biste vidjeli svoje bilješke.
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

  const notes = notesData?.notes || []

  // Group notes by course
  const notesByCourse = notes.reduce((acc: any, note: any) => {
    const courseId = note.lesson.module.course.id
    const courseTitle = note.lesson.module.course.title

    if (!acc[courseId]) {
      acc[courseId] = {
        courseTitle,
        courseSlug: note.lesson.module.course.slug,
        notes: [],
      }
    }

    acc[courseId].notes.push(note)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">Moje bilješke</h1>
            <p className="text-xl text-blue-100">
              Pregled svih bilješki koje ste napravili tijekom učenja
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {notes.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nemate bilješki</h3>
              <p className="text-gray-600 mb-6">
                Počnite pisati bilješke tijekom učenja da biste lakše pratili važne
                informacije.
              </p>
              <Button asChild>
                <Link href="/courses">Pregledaj kurseve</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(notesByCourse).map(([courseId, data]: any) => (
              <Card key={courseId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{data.courseTitle}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {data.notes.length} bilješki
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
                  <div className="space-y-4">
                    {data.notes.map((note: any) => (
                      <div
                        key={note.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-sm">
                                {note.lesson.module.title} → {note.lesson.title}
                              </span>
                            </div>
                            {note.timestamp !== null && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {Math.floor(note.timestamp / 60)}:
                                  {String(note.timestamp % 60).padStart(2, '0')}
                                </span>
                              </div>
                            )}
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (
                                  confirm('Jeste li sigurni da želite obrisati ovu bilješku?')
                                ) {
                                  deleteNoteMutation.mutate(note.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(note.createdAt)}</span>
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

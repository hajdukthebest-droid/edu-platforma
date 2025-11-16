'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import { ArrowLeft, Calendar, Save } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function CreateLiveSessionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    youtubeVideoId: '',
    courseId: '',
    maxAttendees: '',
    isRecorded: true,
    allowQuestions: true,
    chatEnabled: true,
  })

  const { data: courses } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      const response = await api.get('/instructor/courses')
      return response.data.data
    },
  })

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/live-sessions', {
        ...data,
        scheduledStartTime: new Date(data.scheduledStartTime),
        scheduledEndTime: new Date(data.scheduledEndTime),
        maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : undefined,
      })
      return response.data.data
    },
    onSuccess: (data) => {
      router.push(`/live/${data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push('/login')
      return
    }

    if (formData.title.trim() && formData.scheduledStartTime && formData.scheduledEndTime) {
      createSessionMutation.mutate(formData)
    }
  }

  if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Pristup odbijen</h2>
            <p className="text-gray-600 mb-6">
              Samo instruktori mogu zakazivati live sessione.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/live-sessions">Povratak</Link>
              </Button>
            </div>
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
          <Button variant="ghost" asChild>
            <Link href="/live-sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Povratak na live sessione
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Zakaži Live Session
            </CardTitle>
            <p className="text-sm text-gray-600">
              Kreiraj novi live session ili webinar za studente
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course (optional) */}
              <div className="space-y-2">
                <Label htmlFor="course">
                  Tečaj <span className="text-gray-400 font-normal">opcionalno</span>
                </Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Odaberi tečaj" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Bez tečaja (samostalni session)</SelectItem>
                    {courses?.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Naslov *</Label>
                <Input
                  id="title"
                  placeholder="Npr. Uvod u farmakologiju - Live Q&A"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  placeholder="Opiši što će se obrađivati..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Schedule */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Početak *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.scheduledStartTime}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledStartTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Kraj *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.scheduledEndTime}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledEndTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* YouTube Video ID */}
              <div className="space-y-2">
                <Label htmlFor="youtubeVideoId">
                  YouTube Video ID{' '}
                  <span className="text-gray-400 font-normal">za live streaming</span>
                </Label>
                <Input
                  id="youtubeVideoId"
                  placeholder="Npr. dQw4w9WgXcQ"
                  value={formData.youtubeVideoId}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeVideoId: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  Ostavi prazno ako nećeš streamati putem YouTubea
                </p>
              </div>

              {/* Max Attendees */}
              <div className="space-y-2">
                <Label htmlFor="maxAttendees">
                  Maksimalan broj polaznika{' '}
                  <span className="text-gray-400 font-normal">opcionalno</span>
                </Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  placeholder="Ostavi prazno za neograničeno"
                  value={formData.maxAttendees}
                  onChange={(e) =>
                    setFormData({ ...formData, maxAttendees: e.target.value })
                  }
                  min="1"
                />
              </div>

              {/* Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Postavke</h3>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecorded"
                    checked={formData.isRecorded}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isRecorded: checked as boolean })
                    }
                  />
                  <Label htmlFor="isRecorded" className="cursor-pointer">
                    Snimi session za kasniji pregled
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chatEnabled"
                    checked={formData.chatEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, chatEnabled: checked as boolean })
                    }
                  />
                  <Label htmlFor="chatEnabled" className="cursor-pointer">
                    Omogući live chat
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowQuestions"
                    checked={formData.allowQuestions}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, allowQuestions: checked as boolean })
                    }
                  />
                  <Label htmlFor="allowQuestions" className="cursor-pointer">
                    Dozvoli Q&A pitanja
                  </Label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Odustani
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !formData.title.trim() ||
                    !formData.scheduledStartTime ||
                    !formData.scheduledEndTime ||
                    createSessionMutation.isPending
                  }
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createSessionMutation.isPending ? 'Zakazujem...' : 'Zakaži Session'}
                </Button>
              </div>

              {createSessionMutation.isError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  Došlo je do greške prilikom zakazivanja. Pokušajte ponovo.
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

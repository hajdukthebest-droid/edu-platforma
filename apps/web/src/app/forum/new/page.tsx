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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import { ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function NewForumPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const response = await api.get('/forum/categories')
      return response.data.data
    },
  })

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; categoryId: string }) => {
      const response = await api.post('/forum/posts', data)
      return response.data.data
    },
    onSuccess: (data) => {
      router.push(`/forum/posts/${data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push('/login')
      return
    }

    if (title.trim() && content.trim() && categoryId) {
      createPostMutation.mutate({ title, content, categoryId })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-gray-600 mb-6">
              Morate biti prijavljeni da biste kreirali novu temu na forumu.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/forum">Povratak</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Prijava</Link>
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
            <Link href="/forum">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Povratak na forum
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Nova tema na forumu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategorija *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Odaberite kategoriju" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
                  placeholder="Unesite naslov teme..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Sadržaj *</Label>
                <Textarea
                  id="content"
                  placeholder="Opišite svoju temu ili pitanje..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={12}
                  required
                />
                <p className="text-sm text-gray-500">
                  Budite jasni i detaljni. Dobro formulirane teme dobijaju više odgovora.
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Otkaži
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || !content.trim() || !categoryId || createPostMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createPostMutation.isPending ? 'Objavljujem...' : 'Objavi temu'}
                </Button>
              </div>

              {createPostMutation.isError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  Došlo je do greške prilikom objavljivanja teme. Pokušajte ponovo.
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Savjeti za dobru temu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>Koristite jasan i informativan naslov</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>Objasnite problem ili pitanje detaljno</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>Odaberite odgovarajuću kategoriju</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>Budite ljubazni i profesionalni</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>Pretražite forum prije postavljanja pitanja - možda već postoji odgovor</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

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
import { ArrowLeft, Send, Tag, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function NewForumPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const response = await api.get('/forum/categories')
      return response.data.data
    },
  })

  const { data: popularTags } = useQuery({
    queryKey: ['forum-tags'],
    queryFn: async () => {
      const response = await api.get('/forum/tags?limit=10')
      return response.data.data
    },
  })

  const createPostMutation = useMutation({
    mutationFn: async (data: {
      title: string
      content: string
      categoryId: string
      tags?: string[]
    }) => {
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
      createPostMutation.mutate({ title, content, categoryId, tags })
    }
  }

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase()
    if (normalized && !tags.includes(normalized) && tags.length < 5) {
      setTags([...tags, normalized])
      setTagInput('')
    }
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-gray-600 mb-6">
              Morate biti prijavljeni da biste kreirali novo pitanje na forumu.
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
            <CardTitle>Postavi pitanje</CardTitle>
            <p className="text-sm text-gray-600">
              Podijeli svoje pitanje ili temu s zajednicom
            </p>
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
                  placeholder="Npr. Kako funkcionira farmakologija beta blokatora?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Budite konkretni - jasno pitanje dobija bolje odgovore
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">
                  Oznake (do 5){' '}
                  <span className="text-gray-400 font-normal">opcionalno</span>
                </Label>

                {/* Tag input */}
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Dodaj oznaku..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    disabled={tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim() || tags.length >= 5}
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>

                {/* Added tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Popular tag suggestions */}
                {popularTags && popularTags.length > 0 && tags.length < 5 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Popularne oznake:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularTags
                        .filter(({ tag }: any) => !tags.includes(tag))
                        .slice(0, 8)
                        .map(({ tag }: any) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Detaljni opis *</Label>
                <Textarea
                  id="content"
                  placeholder="Detaljno opišite svoje pitanje ili temu. Što više informacija navedete, lakše će vam drugi moći pomoći..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  required
                />
                <p className="text-sm text-gray-500">
                  Uključite sve relevantne detalje, kontekst i što ste već pokušali
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-4 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Otkaži
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !title.trim() ||
                    !content.trim() ||
                    !categoryId ||
                    createPostMutation.isPending
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createPostMutation.isPending ? 'Objavljujem...' : 'Objavi pitanje'}
                </Button>
              </div>

              {createPostMutation.isError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  Došlo je do greške prilikom objavljivanja. Pokušajte ponovo.
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Savjeti za dobro pitanje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Budite specifični:</strong> Jasan i informativan naslov privlači bolje
                odgovore
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Dodajte kontekst:</strong> Objasnite pozadinu problema i što ste već
                pokušali
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Koristite oznake:</strong> Pomažu drugima da brže pronađu vaše pitanje
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Pretražite prvo:</strong> Možda netko već ima odgovor na vaše pitanje
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Označite rješenje:</strong> Kad dobijete odgovor, označite ga kao
                najbolji
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  BookOpen,
  User,
  Tag,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

export default function BlogPostPage() {
  const params = useParams()

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', params.slug],
    queryFn: async () => {
      const response = await api.get(`/blog/${params.slug}`)
      return response.data.data
    },
  })

  // Sample post for demo
  const samplePost = {
    id: '1',
    slug: 'kako-postati-frontend-developer-2024',
    title: 'Kako postati Frontend Developer u 2024.',
    excerpt: 'Kompletan vodič za sve koji žele započeti karijeru u web developmentu.',
    content: `
## Uvod

Frontend development je jedno od najtraženijih područja u IT industriji. U ovom vodiču ćemo proći sve korake potrebne za početak karijere kao frontend developer.

## 1. Osnove: HTML, CSS i JavaScript

### HTML
HTML je temelj svake web stranice. Počnite s učenjem semantičkog HTML-a i pristupačnosti.

### CSS
CSS vam omogućuje stiliziranje web stranica. Naučite Flexbox, Grid i responsive dizajn.

### JavaScript
JavaScript dodaje interaktivnost. Fokusirajte se na ES6+ sintaksu, DOM manipulaciju i asinkrono programiranje.

## 2. Verzija kontrola s Gitom

Git je neophodan alat za svakog developera. Naučite:
- Osnovne naredbe (commit, push, pull, branch)
- Rad s GitHub-om
- Pull requestove i code review

## 3. Frontend Framework

Odaberite jedan framework i savladajte ga:
- **React** - najpopularniji, velika zajednica
- **Vue** - jednostavan za početnike
- **Angular** - enterprise rješenja

## 4. State Management

Razumijevanje upravljanja stanjem je ključno:
- React Context
- Redux ili Zustand
- React Query za server state

## 5. Build alati

Upoznajte se s modernim alatima:
- Vite ili Webpack
- npm/yarn
- ESLint i Prettier

## 6. Portfolio projekti

Izgradite 3-5 kvalitetnih projekata:
- Todo aplikacija
- Weather app
- E-commerce stranica
- Blog platforma

## Zaključak

Put do frontend developera zahtijeva vrijeme i predanost, ali je apsolutno ostvariv. Počnite s osnovama, vježbajte svakodnevno i gradite projekte.

Sretno s učenjem! 🚀
    `,
    image: '/blog/frontend.jpg',
    category: 'programming',
    author: {
      name: 'Marko Petrović',
      avatar: '/avatars/marko.jpg',
      bio: 'Senior Frontend Developer s 10+ godina iskustva',
    },
    publishedAt: '2024-01-15',
    readTime: 8,
    tags: ['frontend', 'javascript', 'react', 'karijera'],
  }

  const displayPost = post || samplePost

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = encodeURIComponent(displayPost.title)

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na blog
            </Link>
          </Button>
        </div>
      </div>

      <article className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="mb-6">
            <Badge variant="outline" className="mb-4">
              <Tag className="h-3 w-3 mr-1" />
              {displayPost.category === 'programming' ? 'Programiranje' : displayPost.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {displayPost.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {displayPost.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {displayPost.author.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{displayPost.author.name}</div>
                  <div className="text-xs">{displayPost.author.bio}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(displayPost.publishedAt), 'dd. MMMM yyyy.', { locale: hr })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {displayPost.readTime} min čitanja
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden bg-gray-200">
            {displayPost.image ? (
              <Image
                src={displayPost.image}
                alt={displayPost.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white/50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            {displayPost.content.split('\n').map((paragraph: string, index: number) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={index}>{paragraph.replace('## ', '')}</h2>
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={index}>{paragraph.replace('### ', '')}</h3>
              }
              if (paragraph.startsWith('- ')) {
                return <li key={index}>{paragraph.replace('- ', '')}</li>
              }
              if (paragraph.startsWith('**')) {
                return <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              }
              if (paragraph.trim()) {
                return <p key={index}>{paragraph}</p>
              }
              return null
            })}
          </div>

          {/* Tags */}
          {displayPost.tags && (
            <div className="flex flex-wrap gap-2 mb-8">
              {displayPost.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Share */}
          <Card className="mb-8">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Podijeli članak</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="h-4 w-4 text-sky-500" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className="h-4 w-4 text-blue-700" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Card */}
          <Card className="mb-8">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-blue-600">
                    {displayPost.author.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{displayPost.author.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{displayPost.author.bio}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/instructors/${displayPost.author.name.toLowerCase().replace(' ', '-')}`}>
                      Pogledaj profil
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-bold mb-2">
                Želite naučiti više?
              </h3>
              <p className="text-blue-100 mb-4">
                Pogledajte naše tečajeve i počnite učiti danas
              </p>
              <Button variant="secondary" asChild>
                <Link href="/courses">
                  Pregledaj tečajeve
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </article>
    </div>
  )
}

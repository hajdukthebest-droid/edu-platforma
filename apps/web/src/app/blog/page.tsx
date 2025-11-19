'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import {
  BookOpen,
  Search,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Tag,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

const CATEGORIES = [
  { id: 'all', name: 'Sve' },
  { id: 'programming', name: 'Programiranje' },
  { id: 'design', name: 'Dizajn' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'career', name: 'Karijera' },
  { id: 'productivity', name: 'Produktivnost' },
]

// Sample blog posts (would be fetched from API)
const SAMPLE_POSTS = [
  {
    id: '1',
    slug: 'kako-postati-frontend-developer-2024',
    title: 'Kako postati Frontend Developer u 2024.',
    excerpt: 'Kompletan vodič za sve koji žele započeti karijeru u web developmentu. Od HTML-a do React-a.',
    image: '/blog/frontend.jpg',
    category: 'programming',
    author: { name: 'Marko Petrović', avatar: '/avatars/marko.jpg' },
    publishedAt: '2024-01-15',
    readTime: 8,
    featured: true,
  },
  {
    id: '2',
    slug: 'ux-trendovi-2024',
    title: 'Top 10 UX trendova za 2024. godinu',
    excerpt: 'Saznajte koji dizajn trendovi će dominirati ove godine i kako ih primijeniti u svojim projektima.',
    image: '/blog/ux-trends.jpg',
    category: 'design',
    author: { name: 'Ana Jurić', avatar: '/avatars/ana.jpg' },
    publishedAt: '2024-01-10',
    readTime: 6,
    featured: true,
  },
  {
    id: '3',
    slug: 'ai-alati-produktivnost',
    title: 'AI alati koji će transformirati vašu produktivnost',
    excerpt: 'Pregled najboljih AI alata za programere, dizajnere i marketingaše u 2024.',
    image: '/blog/ai-tools.jpg',
    category: 'productivity',
    author: { name: 'Ivan Novak', avatar: '/avatars/ivan.jpg' },
    publishedAt: '2024-01-05',
    readTime: 10,
    featured: false,
  },
  {
    id: '4',
    slug: 'kako-napisati-cv',
    title: 'Kako napisati CV koji će vas izdvojiti',
    excerpt: 'Praktični savjeti za kreiranje CV-a koji privlači pažnju recruitera i otvara vrata intervjuima.',
    image: '/blog/cv.jpg',
    category: 'career',
    author: { name: 'Petra Kovačević', avatar: '/avatars/petra.jpg' },
    publishedAt: '2024-01-01',
    readTime: 5,
    featured: false,
  },
  {
    id: '5',
    slug: 'seo-osnove-2024',
    title: 'SEO osnove: Vodič za početnike',
    excerpt: 'Naučite osnove SEO-a i kako optimizirati svoj web sadržaj za bolje rangiranje na Googleu.',
    image: '/blog/seo.jpg',
    category: 'marketing',
    author: { name: 'Tomislav Babić', avatar: '/avatars/tomislav.jpg' },
    publishedAt: '2023-12-28',
    readTime: 7,
    featured: false,
  },
  {
    id: '6',
    slug: 'typescript-vs-javascript',
    title: 'TypeScript vs JavaScript: Što odabrati?',
    excerpt: 'Detaljna usporedba TypeScripta i JavaScripta. Prednosti, nedostaci i kada koristiti koji.',
    image: '/blog/typescript.jpg',
    category: 'programming',
    author: { name: 'Marko Petrović', avatar: '/avatars/marko.jpg' },
    publishedAt: '2023-12-20',
    readTime: 9,
    featured: false,
  },
]

export default function BlogPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  // Fetch blog posts from API
  const { data: posts } = useQuery({
    queryKey: ['blog-posts', category, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category !== 'all') params.append('category', category)
      if (search) params.append('search', search)
      const response = await api.get(`/blog?${params.toString()}`)
      return response.data.data
    },
  })

  // Use sample posts if API returns nothing
  const displayPosts = posts?.length > 0 ? posts : SAMPLE_POSTS
  const filteredPosts = displayPosts.filter((post: any) => {
    const matchesCategory = category === 'all' || post.category === category
    const matchesSearch = !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPosts = filteredPosts.filter((p: any) => p.featured)
  const regularPosts = filteredPosts.filter((p: any) => !p.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="bg-white/20 text-white mb-4">
            <BookOpen className="h-3 w-3 mr-1" />
            Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            EduPlatforma Blog
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Savjeti, tutorijali i novosti iz svijeta online obrazovanja i tehnologije
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži članke..."
              className="pl-10 bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Istaknuti članci
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.slice(0, 2).map((post: any) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video bg-gray-200">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-white/50" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3">
                        {CATEGORIES.find(c => c.id === post.category)?.name}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {post.author.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime} min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <h2 className="text-2xl font-bold mb-6">Svi članci</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post: any) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-gray-200">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white/50" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {CATEGORIES.find(c => c.id === post.category)?.name}
                  </Badge>
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {format(new Date(post.publishedAt), 'dd.MM.yyyy', { locale: hr })}
                    </span>
                    <span>{post.readTime} min čitanja</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nema članaka</h3>
              <p className="text-gray-500">
                {search
                  ? 'Nema rezultata za vašu pretragu'
                  : 'U ovoj kategoriji još nema članaka'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Newsletter CTA */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-2">
              Ne propustite nove članke
            </h3>
            <p className="text-blue-100 mb-6">
              Pretplatite se na newsletter i dobivajte najnovije članke direktno u inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                placeholder="Vaš email"
                className="bg-white text-gray-900"
              />
              <Button variant="secondary">
                Pretplati se
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

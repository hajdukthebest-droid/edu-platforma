'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  Star,
  Quote,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Award,
  Users,
  BookOpen,
  ArrowRight,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Featured testimonials (could be fetched from API)
const FEATURED_TESTIMONIALS = [
  {
    id: 1,
    name: 'Marko Horvat',
    role: 'Frontend Developer',
    company: 'Infobip',
    avatar: '/avatars/marko.jpg',
    rating: 5,
    text: 'Zahvaljujući tečajevima na EduPlatforma, uspio sam napredovati iz junior u senior poziciju za samo godinu dana. Kvaliteta sadržaja je izvanredna, a instruktori su pravi stručnjaci.',
    course: 'Advanced React Patterns',
    beforeTitle: 'Junior Developer',
    afterTitle: 'Senior Frontend Developer',
    featured: true,
  },
  {
    id: 2,
    name: 'Ana Kovačević',
    role: 'UX Designer',
    company: 'Rimac Technology',
    avatar: '/avatars/ana.jpg',
    rating: 5,
    text: 'Promijenila sam karijeru iz marketinga u UX dizajn zahvaljujući certificiranom programu. Sada radim posao iz snova!',
    course: 'UX Design Fundamentals',
    beforeTitle: 'Marketing Specialist',
    afterTitle: 'UX Designer',
    featured: true,
  },
  {
    id: 3,
    name: 'Ivan Novak',
    role: 'Data Scientist',
    company: 'Photomath',
    avatar: '/avatars/ivan.jpg',
    rating: 5,
    text: 'Data Science Learning Path mi je dao sve potrebne vještine za ulazak u industriju. Struktura je savršena za početnike.',
    course: 'Data Science Learning Path',
    beforeTitle: 'Student matematike',
    afterTitle: 'Data Scientist',
    featured: true,
  },
]

const SUCCESS_STATS = [
  { value: '50,000+', label: 'Polaznika', icon: Users },
  { value: '95%', label: 'Zadovoljstvo', icon: Star },
  { value: '10,000+', label: 'Certifikata', icon: Award },
  { value: '85%', label: 'Zaposlenih', icon: Briefcase },
]

const VIDEO_TESTIMONIALS = [
  {
    id: 1,
    name: 'Petra Jurić',
    role: 'Full Stack Developer',
    thumbnail: '/thumbnails/petra.jpg',
    duration: '3:45',
  },
  {
    id: 2,
    name: 'Tomislav Babić',
    role: 'Product Manager',
    thumbnail: '/thumbnails/tomislav.jpg',
    duration: '4:20',
  },
  {
    id: 3,
    name: 'Maja Šimić',
    role: 'Digital Marketer',
    thumbnail: '/thumbnails/maja.jpg',
    duration: '2:55',
  },
]

export default function TestimonialsPage() {
  // Fetch more reviews from API
  const { data: reviews } = useQuery({
    queryKey: ['platform-reviews'],
    queryFn: async () => {
      const response = await api.get('/reviews/featured')
      return response.data.data
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="bg-white/20 text-white mb-4">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Priče uspjeha
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Transformirali smo karijere tisućama studenata
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Pročitajte iskustva naših polaznika i saznajte kako su postigli svoje ciljeve
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {SUCCESS_STATS.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Featured Testimonials */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Istaknute priče uspjeha
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {FEATURED_TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.id} className="relative overflow-hidden">
              <CardContent className="pt-8">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-100" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Career Progress */}
                <div className="bg-green-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-gray-500">{testimonial.beforeTitle}</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="font-medium text-green-700">{testimonial.afterTitle}</span>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role} @ {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Course Badge */}
                <Badge variant="outline" className="mt-4">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {testimonial.course}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Video Testimonials */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Video svjedočanstva
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Pogledajte video priče naših polaznika i čujte iz prve ruke kako su transformirali svoje karijere
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {VIDEO_TESTIMONIALS.map((video) => (
              <div
                key={video.id}
                className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play className="h-8 w-8 text-white fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="font-semibold">{video.name}</div>
                  <div className="text-sm text-gray-300">{video.role}</div>
                </div>
                <Badge className="absolute top-4 right-4 bg-black/50">
                  {video.duration}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* More Reviews */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Što kažu naši polaznici
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {(reviews || []).map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4">"{review.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-medium">
                      {review.user?.firstName?.[0]}
                      {review.user?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {review.user?.firstName} {review.user?.lastName}
                    </div>
                    {review.course && (
                      <div className="text-xs text-gray-500">
                        {review.course.title}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Placeholder cards if no reviews */}
          {(!reviews || reviews.length === 0) && (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={cn(
                            'h-4 w-4',
                            j < 5 - (i % 2)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm mb-4">
                      "Odlični tečajevi s praktičnim primjerima. Instruktori su stručni i uvijek dostupni za pitanja."
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-medium">
                          {['MH', 'AK', 'IN', 'PJ', 'TB', 'MS'][i - 1]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {['Marko H.', 'Ana K.', 'Ivan N.', 'Petra J.', 'Tomislav B.', 'Maja Š.'][i - 1]}
                        </div>
                        <div className="text-xs text-gray-500">
                          Web Development
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Company Logos */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-8">
            Naši polaznici rade u vodećim kompanijama
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['Infobip', 'Rimac', 'Photomath', 'Nanobit', 'Superbet', 'Five'].map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-400">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">
            Budite sljedeća priča uspjeha
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Pridružite se tisućama studenata koji su transformirali svoje karijere s EduPlatforma
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/courses">
                Pregledaj tečajeve
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/learning-paths">
                Istraži putove učenja
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  ArrowRight,
  BookOpen,
  TrendingUp,
  Star,
  Users,
  Loader2,
  Home,
} from 'lucide-react'

interface Domain {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  coverImage?: string
  categories: Array<{
    id: string
    name: string
    slug: string
    icon: string
    _count: {
      courses: number
    }
  }>
}

export default function DomainHomePage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain: domainSlug } = use(params)

  const { data: domain, isLoading } = useQuery<Domain>({
    queryKey: ['domain', domainSlug],
    queryFn: async () => {
      const response = await api.get(`/domains/${domainSlug}`)
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!domain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Područje nije pronađeno</h1>
          <Link href="/domains">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Natrag na odabir područja
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative py-20 text-white"
        style={{
          background: `linear-gradient(135deg, ${domain.color}dd, ${domain.color}99)`,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <Link
              href="/domains"
              className="inline-flex items-center text-white/80 hover:text-white mb-4"
            >
              ← Natrag na sva područja
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl bg-white/20 backdrop-blur"
              >
                {domain.icon}
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2">{domain.name}</h1>
                <p className="text-xl text-white/90">{domain.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{domain.categories.length} kategorija</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>
                  {domain.categories.reduce((sum, cat) => sum + cat._count.courses, 0)}{' '}
                  tečajeva
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Kategorije</h2>
          <p className="text-gray-600">
            Odaberite kategoriju koja vas zanima
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {domain.categories.map((category) => (
            <Link
              key={category.id}
              href={`/courses?category=${category.slug}`}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-blue-500">
                <CardContent className="p-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: domain.color + '15',
                    }}
                  >
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category._count.courses} tečajeva
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Popularni tečajevi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Pogledajte najpopularnije tečajeve u ovom području
              </p>
              <Link href={`/courses?domain=${domainSlug}&sortBy=enrollmentCount`}>
                <Button variant="outline" className="w-full">
                  Pregledaj
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Najbolje ocijenjeni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Tečajevi s najvišim ocjenama korisnika
              </p>
              <Link href={`/courses?domain=${domainSlug}&sortBy=rating`}>
                <Button variant="outline" className="w-full">
                  Pregledaj
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Za početnike
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Počnite s osnovnim tečajevima prilagođenim početnicima
              </p>
              <Link href={`/courses?domain=${domainSlug}&level=BEGINNER`}>
                <Button variant="outline" className="w-full">
                  Pregledaj
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Započnite svoje putovanje učenja danas
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Pronađite tečaj koji odgovara vašim ciljevima i započnite učenje
            </p>
            <Link href={`/courses?domain=${domainSlug}`}>
              <Button
                size="lg"
                style={{
                  backgroundColor: domain.color,
                }}
              >
                Pregledaj sve tečajeve
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

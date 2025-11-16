'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { Search, Loader2, ArrowRight } from 'lucide-react'

interface Domain {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  totalCourses?: number
  totalCategories?: number
}

export default function DomainsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: domainsData, isLoading } = useQuery({
    queryKey: ['domains-with-stats'],
    queryFn: async () => {
      const response = await api.get('/domains/with-stats')
      return response.data.data as Domain[]
    },
  })

  const domains = domainsData || []

  // Filter domains by search
  const filteredDomains = domains.filter((domain) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      domain.name.toLowerCase().includes(search) ||
      domain.description.toLowerCase().includes(search)
    )
  })

  const handleDomainSelect = (slug: string) => {
    // Store selected domain in localStorage
    localStorage.setItem('selectedDomain', slug)
    // Navigate to domain-specific home page
    router.push(`/${slug}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Dobrodošli na Edu Platformu
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Odaberite područje koje vas zanima i započnite svoje putovanje učenja
            </p>
            <p className="text-lg text-blue-200">
              15 različitih domena, 180+ kategorija, tisuće tečajeva
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Pretražite područja... (npr. IT, zdravstvo, marketing)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Domains Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : filteredDomains.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">
              Nema pronađenih područja za "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDomains.map((domain) => (
              <Card
                key={domain.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 hover:border-blue-500"
                onClick={() => handleDomainSelect(domain.slug)}
                style={{
                  borderColor: domain.color + '20',
                }}
              >
                <CardContent className="p-6">
                  {/* Icon & Title */}
                  <div className="mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg"
                      style={{
                        backgroundColor: domain.color + '15',
                      }}
                    >
                      {domain.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                      {domain.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {domain.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <span>{domain.totalCategories || 0} kategorija</span>
                    <span>•</span>
                    <span>{domain.totalCourses || 0} tečajeva</span>
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full group-hover:bg-blue-600"
                    style={{
                      backgroundColor: domain.color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDomainSelect(domain.slug)
                    }}
                  >
                    Istraži
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ne možete se odlučiti?
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Pregledajte sve tečajeve ili potražite preporuke prilagođene vašim interesima
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" onClick={() => router.push('/courses')}>
                Pregledaj sve tečajeve
              </Button>
              <Button size="lg" onClick={() => router.push('/dashboard')}>
                Moj Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

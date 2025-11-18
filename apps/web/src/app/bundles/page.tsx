'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { Package, Clock, BookOpen, Percent, Tag } from 'lucide-react'

interface Bundle {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  originalPrice: string
  discountedPrice: string
  savingsPercent: number
  isLimited: boolean
  endDate: string | null
  courses: Array<{
    course: {
      id: string
      title: string
      thumbnail: string | null
      level: string
      duration: number | null
    }
  }>
  _count: {
    payments: number
  }
}

export default function BundlesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['bundles'],
    queryFn: async () => {
      const response = await api.get('/shop/bundles')
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const bundles = data?.bundles || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Paketi tečajeva</h1>
            <p className="text-xl text-indigo-100">
              Uštedite kupnjom paketa povezanih tečajeva po povoljnijim cijenama
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {bundles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Trenutno nema dostupnih paketa</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle: Bundle) => {
              const timeLeft = bundle.endDate
                ? Math.ceil((new Date(bundle.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null

              return (
                <Card key={bundle.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      {bundle.isLimited && timeLeft && timeLeft > 0 && (
                        <Badge variant="destructive">
                          <Clock className="h-3 w-3 mr-1" />
                          Još {timeLeft} dana
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        <Percent className="h-3 w-3 mr-1" />
                        -{bundle.savingsPercent.toFixed(0)}%
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{bundle.name}</CardTitle>
                    {bundle.description && (
                      <CardDescription className="line-clamp-2">
                        {bundle.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto">
                    {/* Courses preview */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{bundle.courses.length} tečajeva uključeno</span>
                      </div>
                      <div className="space-y-1">
                        {bundle.courses.slice(0, 3).map((bc) => (
                          <div key={bc.course.id} className="text-sm text-gray-500 truncate">
                            {bc.course.title}
                          </div>
                        ))}
                        {bundle.courses.length > 3 && (
                          <div className="text-sm text-gray-400">
                            +{bundle.courses.length - 3} više...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-2xl font-bold text-indigo-600">
                        {parseFloat(bundle.discountedPrice).toFixed(2)} EUR
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {parseFloat(bundle.originalPrice).toFixed(2)} EUR
                      </span>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/bundles/${bundle.slug}`}>Pregledaj paket</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

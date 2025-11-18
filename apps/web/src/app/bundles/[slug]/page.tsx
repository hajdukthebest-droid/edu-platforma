'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import {
  Package,
  Clock,
  BookOpen,
  Percent,
  Tag,
  CheckCircle2,
  Star,
  Users,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function BundleDetailPage({ params }: { params: { slug: string } }) {
  const { user } = useAuth()
  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState<any>(null)

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['bundle', params.slug],
    queryFn: async () => {
      const response = await api.get(`/shop/bundles/slug/${params.slug}`)
      return response.data.data
    },
  })

  const validatePromoMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/shop/promo-codes/validate', {
        code: promoCode,
        amount: parseFloat(bundle.discountedPrice),
        bundleId: bundle.id,
      })
      return response.data.data
    },
    onSuccess: (data) => {
      setPromoResult(data)
    },
    onError: (error: any) => {
      setPromoResult({
        valid: false,
        message: error.response?.data?.message || 'Greška pri provjeri koda',
      })
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Paket nije pronađen
      </div>
    )
  }

  const timeLeft = bundle.endDate
    ? Math.ceil((new Date(bundle.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const finalPrice = promoResult?.valid
    ? promoResult.finalPrice
    : parseFloat(bundle.discountedPrice)

  const totalDuration = bundle.courses.reduce(
    (sum: number, bc: any) => sum + (bc.course.duration || 0),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/bundles"
            className="inline-flex items-center gap-2 text-indigo-100 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Natrag na pakete
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              {bundle.isLimited && timeLeft && timeLeft > 0 && (
                <Badge variant="destructive" className="bg-red-500">
                  <Clock className="h-3 w-3 mr-1" />
                  Još {timeLeft} dana
                </Badge>
              )}
              <Badge variant="secondary" className="bg-white/20">
                <Percent className="h-3 w-3 mr-1" />
                Ušteda {bundle.savingsPercent.toFixed(0)}%
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{bundle.name}</h1>
            {bundle.description && (
              <p className="text-xl text-indigo-100">{bundle.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Courses */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tečajevi u paketu ({bundle.courses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bundle.courses.map((bc: any, index: number) => (
                    <div
                      key={bc.course.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{bc.course.title}</h3>
                        {bc.course.shortDescription && (
                          <p className="text-sm text-gray-600 mb-2">
                            {bc.course.shortDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {bc.course.level === 'BEGINNER' && 'Početnik'}
                            {bc.course.level === 'INTERMEDIATE' && 'Srednji'}
                            {bc.course.level === 'ADVANCED' && 'Napredni'}
                          </span>
                          {bc.course.duration && (
                            <span>
                              {Math.floor(bc.course.duration / 60)}h {bc.course.duration % 60}min
                            </span>
                          )}
                          {bc.course.averageRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {bc.course.averageRating.toFixed(1)}
                            </span>
                          )}
                          {bc.course.enrollmentCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {bc.course.enrollmentCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-400 line-through">
                          {parseFloat(bc.course.price).toFixed(2)} EUR
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Purchase */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {/* Pricing */}
                <div className="text-center pb-6 border-b">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-indigo-600">
                      {finalPrice.toFixed(2)} EUR
                    </span>
                    {promoResult?.valid && (
                      <Badge className="bg-green-100 text-green-800">
                        -{promoResult.discountAmount.toFixed(2)} EUR
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 line-through">
                    {parseFloat(bundle.originalPrice).toFixed(2)} EUR
                  </span>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Ušteda: {(parseFloat(bundle.originalPrice) - finalPrice).toFixed(2)} EUR
                  </p>
                </div>

                {/* Promo Code */}
                {user && (
                  <div className="py-4 border-b">
                    <label className="text-sm font-medium mb-2 block">Promo kod</label>
                    <div className="flex gap-2">
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Unesite kod"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => validatePromoMutation.mutate()}
                        disabled={!promoCode || validatePromoMutation.isPending}
                      >
                        Primijeni
                      </Button>
                    </div>
                    {promoResult && (
                      <p
                        className={`text-sm mt-2 ${
                          promoResult.valid ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {promoResult.valid
                          ? `Popust od ${promoResult.discountAmount.toFixed(2)} EUR primijenjen!`
                          : promoResult.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Purchase Button */}
                <div className="pt-4">
                  <Button className="w-full" size="lg">
                    Kupi paket
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Sigurna kupnja putem Stripe-a
                  </p>
                </div>

                {/* Bundle Info */}
                <div className="mt-6 pt-4 border-t space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tečajeva:</span>
                    <span className="font-medium">{bundle.courses.length}</span>
                  </div>
                  {totalDuration > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ukupno trajanje:</span>
                      <span className="font-medium">
                        {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kupljeno:</span>
                    <span className="font-medium">{bundle._count.payments}x</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Doživotni pristup
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Certifikati za sve tečajeve
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Pristup s bilo kojeg uređaja
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

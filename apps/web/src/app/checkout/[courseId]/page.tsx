'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  CreditCard,
  ShieldCheck,
  Clock,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Lock,
} from 'lucide-react'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: course, isLoading } = useQuery({
    queryKey: ['checkout-course', courseId],
    queryFn: async () => {
      const response = await api.get(`/courses/${courseId}`)
      return response.data.data
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/payments/checkout', { courseId })
      return response.data.data
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      }
    },
    onError: (error: any) => {
      setIsProcessing(false)
      alert(error.response?.data?.message || 'Greška pri pokretanju plaćanja')
    },
  })

  const handleCheckout = () => {
    setIsProcessing(true)
    checkoutMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tečaj nije pronađen</h1>
          <Button asChild>
            <Link href="/courses">Pretraži tečajeve</Link>
          </Button>
        </div>
      </div>
    )
  }

  const price = Number(course.price) || 0

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href={`/courses/${course.slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag na tečaj
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pregled narudžbe</CardTitle>
                <CardDescription>Pregledajte detalje prije plaćanja</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {course.thumbnailUrl ? (
                    <div className="relative w-32 h-20 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {course.creator?.firstName} {course.creator?.lastName}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {course.averageRating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {course.averageRating}
                        </span>
                      )}
                      {course._count?.enrollments && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course._count.enrollments} studenata
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* What's included */}
                <div>
                  <h4 className="font-medium mb-3">Što je uključeno:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Doživotni pristup svim materijalima
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Certifikat po završetku
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Pristup forum zajednici
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Kvizovi i praktične vježbe
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Security badges */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-xs text-gray-600">Sigurno plaćanje</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-xs text-gray-600">Instant pristup</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Lock className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-xs text-gray-600">SSL enkripicja</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Sažetak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Cijena tečaja</span>
                  <span>{price.toFixed(2)} EUR</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Ukupno</span>
                  <span>{price.toFixed(2)} EUR</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || checkoutMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing || checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Obrada...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Plati {price.toFixed(2)} EUR
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Klikom na gumb bit ćete preusmjereni na sigurnu Stripe stranicu za plaćanje
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Powered by</span>
                  <Badge variant="outline">Stripe</Badge>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

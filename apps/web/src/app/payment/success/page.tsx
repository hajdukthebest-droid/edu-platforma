'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import {
  CheckCircle2,
  BookOpen,
  Receipt,
  ArrowRight,
  PartyPopper,
  Mail,
} from 'lucide-react'
import confetti from 'canvas-confetti'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [hasConfetti, setHasConfetti] = useState(false)

  // Get payment details based on session
  const { data: paymentInfo, isLoading } = useQuery({
    queryKey: ['payment-success', sessionId],
    queryFn: async () => {
      // Get user's recent payments to find this one
      const response = await api.get('/payments?limit=1')
      return response.data.data?.payments?.[0]
    },
    enabled: !!sessionId,
  })

  // Trigger confetti on successful load
  useEffect(() => {
    if (paymentInfo && !hasConfetti) {
      setHasConfetti(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [paymentInfo, hasConfetti])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Plaćanje uspješno!</CardTitle>
            <CardDescription className="text-lg">
              Hvala vam na kupnji. Sada imate pristup tečaju.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentInfo && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Detalji narudžbe
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tečaj:</span>
                    <span className="font-medium">{paymentInfo.course?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Iznos:</span>
                    <span className="font-medium">
                      {Number(paymentInfo.amount).toFixed(2)} {paymentInfo.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID transakcije:</span>
                    <span className="font-mono text-xs">{paymentInfo.id?.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                <Mail className="h-5 w-5" />
                Potvrda poslana
              </h3>
              <p className="text-sm text-blue-700">
                Poslali smo vam email s potvrdom kupnje i detaljima za pristup tečaju.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {paymentInfo?.course?.slug ? (
                <Button asChild className="flex-1">
                  <Link href={`/courses/${paymentInfo.course.slug}`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Započni učenje
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="flex-1">
                  <Link href="/dashboard">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Idi na Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="flex-1">
                <Link href="/payment/history">
                  <Receipt className="h-4 w-4 mr-2" />
                  Povijest plaćanja
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <PartyPopper className="h-4 w-4" />
                Sretno učenje!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

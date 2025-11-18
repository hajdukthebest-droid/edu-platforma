'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  Receipt,
  Download,
  ExternalLink,
  CreditCard,
  Calendar,
  BookOpen,
  ArrowLeft,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function PaymentHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => {
      const response = await api.get('/payments')
      return response.data.data
    },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Uspješno</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Na čekanju</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Otkazano</Badge>
      case 'REFUNDED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Refundirano</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Povijest plaćanja</h1>
              <p className="text-gray-600 mt-1">Pregled svih vaših transakcija</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!data?.payments || data.payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nema transakcija</h3>
              <p className="text-gray-500 mb-4">
                Još niste napravili nijednu kupnju.
              </p>
              <Button asChild>
                <Link href="/courses">Pregledaj tečajeve</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-500 mb-1">Ukupno transakcija</div>
                  <div className="text-2xl font-bold">{data.pagination.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-500 mb-1">Ukupno potrošeno</div>
                  <div className="text-2xl font-bold">
                    {data.payments
                      .filter((p: any) => p.status === 'COMPLETED')
                      .reduce((sum: number, p: any) => sum + Number(p.amount), 0)
                      .toFixed(2)} EUR
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-500 mb-1">Kupljenih tečajeva</div>
                  <div className="text-2xl font-bold">
                    {data.payments.filter((p: any) => p.status === 'COMPLETED').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions list */}
            <Card>
              <CardHeader>
                <CardTitle>Transakcije</CardTitle>
                <CardDescription>Lista svih vaših plaćanja</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {payment.course?.title || 'Nepoznat tečaj'}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(payment.createdAt)}
                            </span>
                            <span className="font-mono text-xs">
                              #{payment.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            {Number(payment.amount).toFixed(2)} {payment.currency}
                          </div>
                          <div className="mt-1">{getStatusBadge(payment.status)}</div>
                        </div>
                        {payment.course?.slug && payment.status === 'COMPLETED' && (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/courses/${payment.course.slug}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination info */}
                {data.pagination.totalPages > 1 && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Stranica {data.pagination.page} od {data.pagination.totalPages}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help section */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Trebate pomoć s transakcijom?</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Kontaktirajte našu podršku za bilo kakva pitanja
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/help">Centar za pomoć</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  XCircle,
  ArrowLeft,
  HelpCircle,
  RefreshCw,
  Home,
} from 'lucide-react'

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Plaćanje otkazano</CardTitle>
            <CardDescription className="text-lg">
              Vaše plaćanje nije dovršeno. Niste naplaćeni.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h3 className="font-semibold mb-3">Zašto je plaćanje otkazano?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  Možda ste kliknuli "Natrag" ili zatvorili stranicu za plaćanje
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  Sesija plaćanja je možda istekla
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  Došlo je do problema s karticom ili bankom
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.history.back()}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Pokušaj ponovno
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/courses">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Pretraži tečajeve
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-3">
                Trebate pomoć?
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/help">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Centar za pomoć
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-1" />
                    Početna
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

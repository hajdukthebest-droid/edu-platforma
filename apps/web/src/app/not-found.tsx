import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="relative -mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stranica nije pronađena
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Žao nam je, stranica koju tražite ne postoji ili je premještena.
              Provjerite URL ili se vratite na početnu stranicu.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Početna
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Tečajevi
            </Link>
          </Button>
          <Button asChild>
            <Link href="/search">
              <Search className="h-4 w-4 mr-2" />
              Pretraži
            </Link>
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>
            Trebate pomoć?{' '}
            <Link href="/help/contact" className="text-blue-600 hover:underline">
              Kontaktirajte nas
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

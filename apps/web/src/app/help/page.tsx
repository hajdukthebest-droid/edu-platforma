'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  CreditCard,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  PlayCircle,
  Search,
  Settings,
  Shield,
  Users,
  ChevronRight,
  Mail,
  FileQuestion,
  Award,
} from 'lucide-react'
import { useState } from 'react'

const HELP_CATEGORIES = [
  {
    title: 'Početak rada',
    description: 'Kako kreirati račun i započeti s učenjem',
    icon: PlayCircle,
    href: '/help/faq?category=getting-started',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    title: 'Tečajevi i učenje',
    description: 'Pristup tečajevima, praćenje napretka',
    icon: BookOpen,
    href: '/help/faq?category=courses',
    color: 'text-green-600 bg-green-100',
  },
  {
    title: 'Plaćanje i pretplate',
    description: 'Informacije o cijenama i načinima plaćanja',
    icon: CreditCard,
    href: '/help/faq?category=billing',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    title: 'Certifikati i postignuća',
    description: 'Kako dobiti i podijeliti certifikate',
    icon: Award,
    href: '/help/faq?category=certificates',
    color: 'text-yellow-600 bg-yellow-100',
  },
  {
    title: 'Postavke računa',
    description: 'Promjena profila, lozinke i privatnosti',
    icon: Settings,
    href: '/help/faq?category=account',
    color: 'text-gray-600 bg-gray-100',
  },
  {
    title: 'Tehnička podrška',
    description: 'Problemi s video playerom ili platformom',
    icon: HelpCircle,
    href: '/help/faq?category=technical',
    color: 'text-red-600 bg-red-100',
  },
]

const POPULAR_QUESTIONS = [
  {
    question: 'Kako se prijaviti na tečaj?',
    href: '/help/faq#enroll',
  },
  {
    question: 'Mogu li dobiti povrat novca?',
    href: '/help/faq#refund',
  },
  {
    question: 'Kako preuzeti certifikat?',
    href: '/help/faq#certificate',
  },
  {
    question: 'Zašto se video ne učitava?',
    href: '/help/faq#video-issues',
  },
  {
    question: 'Kako promijeniti email adresu?',
    href: '/help/faq#change-email',
  },
]

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/help/faq?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Kako vam možemo pomoći?</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Pretražite našu bazu znanja ili pregledajte kategorije ispod
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Pretražite članke pomoći..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 text-lg rounded-xl text-gray-900"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Traži
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Pregledaj po kategorijama</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HELP_CATEGORIES.map((category) => {
              const Icon = category.icon
              return (
                <Link key={category.title} href={category.href}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${category.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{category.title}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Popular Questions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5" />
                Česta pitanja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {POPULAR_QUESTIONS.map((item) => (
                  <li key={item.question}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                      {item.question}
                    </Link>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/help/faq">
                  Vidi sva pitanja
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kontaktirajte nas
              </CardTitle>
              <CardDescription>
                Niste pronašli odgovor? Kontaktirajte našu podršku.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="font-medium">Email podrška</div>
                  <div className="text-sm text-gray-600">Odgovaramo unutar 24h</div>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href="/help/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Pošalji upit
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <Link href="/courses" className="group">
                <div className="p-4 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">Pregledaj tečajeve</div>
                </div>
              </Link>
              <Link href="/dashboard" className="group">
                <div className="p-4 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium">Moj dashboard</div>
                </div>
              </Link>
              <Link href="/settings" className="group">
                <div className="p-4 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="font-medium">Postavke</div>
                </div>
              </Link>
              <Link href="/forum" className="group">
                <div className="p-4 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
                  <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="font-medium">Zajednica</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

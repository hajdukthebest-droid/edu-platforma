'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Home,
  BookOpen,
  Users,
  GraduationCap,
  HelpCircle,
  Building2,
  FileText,
  Gift,
  DollarSign,
  Info,
  Briefcase,
  Star,
  Map,
  MessageSquare,
  Settings,
  BarChart,
  Video,
  Award,
  Bookmark,
  Bell,
  CreditCard,
} from 'lucide-react'

const SITEMAP_SECTIONS = [
  {
    title: 'Glavne stranice',
    icon: Home,
    links: [
      { href: '/', label: 'Početna' },
      { href: '/courses', label: 'Tečajevi' },
      { href: '/learning-paths', label: 'Putovi učenja' },
      { href: '/bundles', label: 'Paketi' },
      { href: '/live-sessions', label: 'Live sesije' },
      { href: '/forum', label: 'Forum' },
      { href: '/blog', label: 'Blog' },
      { href: '/search', label: 'Pretraži' },
    ],
  },
  {
    title: 'Korisnički račun',
    icon: Users,
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/courses', label: 'Moji tečajevi' },
      { href: '/dashboard/analytics', label: 'Analitika' },
      { href: '/notes', label: 'Bilješke' },
      { href: '/bookmarks', label: 'Bookmarks' },
      { href: '/certificates', label: 'Certifikati' },
      { href: '/achievements', label: 'Postignuća' },
      { href: '/notifications', label: 'Obavijesti' },
      { href: '/messages', label: 'Poruke' },
      { href: '/settings', label: 'Postavke' },
    ],
  },
  {
    title: 'Instruktori',
    icon: GraduationCap,
    links: [
      { href: '/instructor', label: 'Instructor Panel' },
      { href: '/instructor/courses', label: 'Moji tečajevi' },
      { href: '/instructor/earnings', label: 'Zarada' },
      { href: '/instructor/analytics', label: 'Analitika' },
      { href: '/become-instructor', label: 'Postani instruktor' },
    ],
  },
  {
    title: 'Kupovina',
    icon: CreditCard,
    links: [
      { href: '/pricing', label: 'Cijene i planovi' },
      { href: '/gift', label: 'Poklon kartice' },
      { href: '/compare', label: 'Usporedi tečajeve' },
      { href: '/payment/history', label: 'Povijest plaćanja' },
      { href: '/dashboard/referrals', label: 'Referalni program' },
    ],
  },
  {
    title: 'Pomoć i podrška',
    icon: HelpCircle,
    links: [
      { href: '/help', label: 'Centar za pomoć' },
      { href: '/help/faq', label: 'Česta pitanja' },
      { href: '/help/contact', label: 'Kontakt' },
    ],
  },
  {
    title: 'O nama',
    icon: Info,
    links: [
      { href: '/about', label: 'O EduPlatforma' },
      { href: '/testimonials', label: 'Iskustva korisnika' },
      { href: '/careers', label: 'Karijere' },
      { href: '/enterprise', label: 'Za tvrtke' },
    ],
  },
  {
    title: 'Pravne informacije',
    icon: FileText,
    links: [
      { href: '/terms', label: 'Uvjeti korištenja' },
      { href: '/privacy', label: 'Politika privatnosti' },
      { href: '/accessibility', label: 'Pristupačnost' },
    ],
  },
  {
    title: 'Autentifikacija',
    icon: Users,
    links: [
      { href: '/login', label: 'Prijava' },
      { href: '/register', label: 'Registracija' },
      { href: '/forgot-password', label: 'Zaboravljena lozinka' },
    ],
  },
]

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Map className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Mapa stranica</h1>
              <p className="text-gray-600">Pregled svih stranica na EduPlatforma</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SITEMAP_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  GraduationCap,
} from 'lucide-react'

const FOOTER_LINKS = {
  platform: {
    title: 'Platforma',
    links: [
      { href: '/courses', label: 'Tečajevi' },
      { href: '/learning-paths', label: 'Putovi učenja' },
      { href: '/bundles', label: 'Paketi' },
      { href: '/live-sessions', label: 'Live sesije' },
      { href: '/pricing', label: 'Cijene' },
      { href: '/enterprise', label: 'Za tvrtke' },
    ],
  },
  resources: {
    title: 'Resursi',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/forum', label: 'Forum' },
      { href: '/help', label: 'Centar za pomoć' },
      { href: '/help/faq', label: 'FAQ' },
      { href: '/testimonials', label: 'Iskustva' },
    ],
  },
  company: {
    title: 'Tvrtka',
    links: [
      { href: '/about', label: 'O nama' },
      { href: '/careers', label: 'Karijere' },
      { href: '/become-instructor', label: 'Postani instruktor' },
      { href: '/help/contact', label: 'Kontakt' },
    ],
  },
  legal: {
    title: 'Pravno',
    links: [
      { href: '/terms', label: 'Uvjeti korištenja' },
      { href: '/privacy', label: 'Privatnost' },
      { href: '/accessibility', label: 'Pristupačnost' },
      { href: '/sitemap', label: 'Mapa stranica' },
    ],
  },
}

const SOCIAL_LINKS = [
  { href: 'https://facebook.com/eduplatforma', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com/eduplatforma', icon: Twitter, label: 'Twitter' },
  { href: 'https://linkedin.com/company/eduplatforma', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://instagram.com/eduplatforma', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com/eduplatforma', icon: Youtube, label: 'YouTube' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/newsletter/subscribe', { email })
      return response.data
    },
    onSuccess: () => {
      setSubscribed(true)
      setEmail('')
    },
  })

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      subscribeMutation.mutate(email)
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand & Newsletter */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">EduPlatforma</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Vodeća hrvatska platforma za online učenje. Transformirajte svoju karijeru
              s kvalitetnim tečajevima od stručnjaka.
            </p>

            {/* Newsletter */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">Newsletter</h4>
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Hvala na pretplati!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@email.com"
                    className="bg-gray-800 border-gray-700 text-sm"
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={subscribeMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a
              href="mailto:info@eduplatforma.hr"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              info@eduplatforma.hr
            </a>
            <a
              href="tel:+38512345678"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
              +385 1 234 5678
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Zagreb, Hrvatska
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} EduPlatforma d.o.o. Sva prava pridržana.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-white transition-colors">
                Uvjeti
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privatnost
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Pristupačnost
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

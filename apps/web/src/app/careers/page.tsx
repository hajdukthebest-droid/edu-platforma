'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Coffee,
  Laptop,
  GraduationCap,
  Plane,
  ArrowRight,
  Building,
  Globe,
  Zap,
} from 'lucide-react'

const JOB_OPENINGS = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Zagreb / Remote',
    type: 'Full-time',
    description: 'Tražimo iskusnog frontend developera za rad na našoj React/Next.js platformi.',
    requirements: ['5+ godina iskustva s React', 'TypeScript', 'Next.js'],
  },
  {
    id: 2,
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Zagreb / Remote',
    type: 'Full-time',
    description: 'Razvijaj skalabilne API-je i mikroservise za brzorastuću EdTech platformu.',
    requirements: ['Node.js/Python', 'PostgreSQL', 'AWS/GCP'],
  },
  {
    id: 3,
    title: 'Product Designer',
    department: 'Design',
    location: 'Zagreb',
    type: 'Full-time',
    description: 'Dizajniraj korisničko iskustvo koje pomaže studentima u učenju.',
    requirements: ['Figma', 'User Research', '3+ godina UX iskustva'],
  },
  {
    id: 4,
    title: 'Content Marketing Manager',
    department: 'Marketing',
    location: 'Zagreb / Remote',
    type: 'Full-time',
    description: 'Kreiraj i upravljaj content strategijom za privlačenje novih studenata.',
    requirements: ['SEO', 'Content Creation', 'Analytics'],
  },
  {
    id: 5,
    title: 'Customer Success Specialist',
    department: 'Support',
    location: 'Zagreb',
    type: 'Full-time',
    description: 'Pomozi korisnicima da ostvare maksimum iz naše platforme.',
    requirements: ['Komunikacijske vještine', 'Problem solving', 'Engleski jezik'],
  },
  {
    id: 6,
    title: 'Video Editor',
    department: 'Content',
    location: 'Remote',
    type: 'Contract',
    description: 'Montiraj i obrađuj edukativne video sadržaje za naše tečajeve.',
    requirements: ['Premiere Pro/DaVinci', 'After Effects', 'Motion graphics'],
  },
]

const BENEFITS = [
  { icon: Laptop, title: 'Rad od kuće', description: 'Fleksibilan hibridni model rada' },
  { icon: GraduationCap, title: 'Edukacija', description: 'Besplatan pristup svim tečajevima' },
  { icon: Heart, title: 'Zdravstveno', description: 'Privatno zdravstveno osiguranje' },
  { icon: Coffee, title: 'Oprema', description: 'Laptop i oprema po izboru' },
  { icon: Plane, title: 'Godišnji odmor', description: '25 dana godišnjeg + slobodni dani' },
  { icon: Users, title: 'Tim building', description: 'Redovni timski događaji i putovanja' },
]

const DEPARTMENTS = ['Sve', 'Engineering', 'Design', 'Marketing', 'Support', 'Content']

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <Badge className="bg-white/20 text-white mb-4">
            <Briefcase className="h-3 w-3 mr-1" />
            Karijere
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Gradimo budućnost obrazovanja
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            Pridružite se strastvenom timu koji transformira način na koji ljudi uče.
            Tražimo talentirane ljude koji žele napraviti razliku.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="#positions">
              Pogledaj otvorene pozicije
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>

      {/* Why Join Us */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Zašto EduPlatforma?</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Radimo na misiji koja je važna - demokratizacija obrazovanja za sve
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">Brzi rast</h3>
              <p className="text-sm text-gray-600">
                Rastemo 100% godišnje i širimo se na nova tržišta. Prilike za napredovanje su ogromne.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Globalni utjecaj</h3>
              <p className="text-sm text-gray-600">
                Vaš rad utječe na živote tisuća studenata iz cijelog svijeta svaki dan.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Sjajan tim</h3>
              <p className="text-sm text-gray-600">
                Radite s najboljima u industriji - stručnjacima iz Googlea, Amazona i drugih tech giganata.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Benefiti</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Job Openings */}
      <div id="positions" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Otvorene pozicije</h2>
        <p className="text-gray-600 text-center mb-8">
          Pronađite svoju sljedeću priliku
        </p>

        {/* Filter by department */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {DEPARTMENTS.map((dept) => (
            <Button
              key={dept}
              variant={dept === 'Sve' ? 'default' : 'outline'}
              size="sm"
            >
              {dept}
            </Button>
          ))}
        </div>

        {/* Job listings */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {JOB_OPENINGS.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      {job.type === 'Contract' && (
                        <Badge variant="secondary">Ugovor</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.requirements.map((req, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/careers/${job.id}`}>
                      Prijavi se
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Culture Section */}
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Naša kultura</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Transparentnost</h3>
                <p className="text-gray-600 mb-6">
                  Otvoreno dijelimo informacije o poslovanju, financijama i strategiji.
                  Vjerujemo da informirani tim donosi bolje odluke.
                </p>
                <h3 className="font-semibold mb-3">Autonomija</h3>
                <p className="text-gray-600">
                  Dajemo slobodu u načinu rada. Fokusiramo se na rezultate, ne na sate.
                  Vjerujemo stručnjacima da znaju najbolje kako obaviti svoj posao.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Kontinuirano učenje</h3>
                <p className="text-gray-600 mb-6">
                  Potičemo eksperimentiranje i učenje iz grešaka. Svaki tjedan imamo
                  tech talks i radionice.
                </p>
                <h3 className="font-semibold mb-3">Raznolikost i uključivost</h3>
                <p className="text-gray-600">
                  Cijenimo različite perspektive. Gradimo tim u kojem se svi osjećaju
                  dobrodošlo i cijenjeno.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ne vidite poziciju za sebe?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Pošaljite nam otvorenu prijavu. Uvijek tražimo talentirane ljude
            koji žele pridonijeti našoj misiji.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/help/contact">
              Pošalji otvorenu prijavu
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

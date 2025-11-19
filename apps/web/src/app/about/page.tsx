'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Heart,
  Users,
  Award,
  BookOpen,
  Globe,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Linkedin,
  Twitter,
  Mail,
  GraduationCap,
  Building,
  Calendar,
} from 'lucide-react'

const STATS = [
  { value: '50,000+', label: 'Aktivnih polaznika', icon: Users },
  { value: '500+', label: 'Tečajeva', icon: BookOpen },
  { value: '150+', label: 'Instruktora', icon: GraduationCap },
  { value: '30+', label: 'Zemalja', icon: Globe },
]

const VALUES = [
  {
    icon: Target,
    title: 'Kvaliteta iznad svega',
    description: 'Svaki tečaj prolazi strogu provjeru kvalitete. Surađujemo samo s provjerenim stručnjacima.',
  },
  {
    icon: Heart,
    title: 'Pristupačno obrazovanje',
    description: 'Vjerujemo da kvalitetno obrazovanje treba biti dostupno svima, bez obzira na lokaciju ili financije.',
  },
  {
    icon: Lightbulb,
    title: 'Praktično znanje',
    description: 'Fokusiramo se na vještine koje su stvarno tražene na tržištu rada. Teorija potkrijepljena praksom.',
  },
  {
    icon: TrendingUp,
    title: 'Kontinuirano učenje',
    description: 'Podržavamo cjeloživotno učenje i redovito ažuriramo sadržaje prema najnovijim trendovima.',
  },
]

const TEAM = [
  {
    name: 'Marko Petrović',
    role: 'CEO & Founder',
    bio: 'Bivši Google inženjer s 15 godina iskustva u tech industriji.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Ana Jurić',
    role: 'CTO',
    bio: 'Stručnjakinja za EdTech s doktoratom iz računalnih znanosti.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Ivan Novak',
    role: 'Head of Content',
    bio: 'Razvija kurikulum s timom od 50+ instruktora i content kreatora.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Petra Kovačević',
    role: 'Head of Product',
    bio: 'Vodi razvoj platforme i korisničkog iskustva.',
    linkedin: '#',
    twitter: '#',
  },
]

const TIMELINE = [
  {
    year: '2019',
    title: 'Osnivanje',
    description: 'EduPlatforma je osnovana s misijom demokratizacije obrazovanja u Hrvatskoj.',
  },
  {
    year: '2020',
    title: 'Lansiranje platforme',
    description: 'Objavili smo prvih 50 tečajeva i dosegnuli 5,000 korisnika.',
  },
  {
    year: '2021',
    title: 'Ekspanzija',
    description: 'Proširili smo se na cijelu regiju i uveli certificirane programe.',
  },
  {
    year: '2022',
    title: 'Partnerstva',
    description: 'Sklopili partnerstva s vodećim kompanijama i sveučilištima.',
  },
  {
    year: '2023',
    title: '50,000 polaznika',
    description: 'Dosegli smo milestone od 50,000 aktivnih polaznika.',
  },
  {
    year: '2024',
    title: 'AI i inovacije',
    description: 'Uveli personalizirano učenje pomoću AI i nove interaktivne formate.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <Badge className="bg-white/20 text-white mb-4">
            O nama
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Transformiramo obrazovanje za digitalnu eru
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            EduPlatforma je vodeća hrvatska platforma za online učenje. Naša misija je
            omogućiti svakome pristup kvalitetnom obrazovanju i pomoći u razvoju karijere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/courses">
                Istraži tečajeve
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/careers">
                Pridruži se timu
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {STATS.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Naša misija</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Vjerujemo da obrazovanje ima moć transformirati živote. Naša misija je stvoriti
            platformu gdje svatko može naučiti nove vještine, unaprijediti karijeru i
            ostvariti svoje profesionalne ciljeve. Povezujemo najbolje instruktore s
            motiviranim studentima i stvaramo zajednicu cjeloživotnog učenja.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Naše vrijednosti</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {VALUES.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Naša povijest</h2>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 md:left-1/2 md:-translate-x-1/2" />
            {TIMELINE.map((item, index) => (
              <div
                key={index}
                className={`relative flex items-center gap-6 mb-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="hidden md:block md:w-1/2" />
                <div className="absolute left-4 w-3 h-3 bg-blue-600 rounded-full md:left-1/2 md:-translate-x-1/2" />
                <Card className="ml-10 md:ml-0 md:w-1/2">
                  <CardContent className="pt-4 pb-4">
                    <Badge variant="outline" className="mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {item.year}
                    </Badge>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Naš tim</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Strastven tim stručnjaka posvećen transformaciji obrazovanja
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {TEAM.map((member, index) => (
              <Card key={index}>
                <CardContent className="pt-6 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-blue-600 mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={member.linkedin}>
                        <Linkedin className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={member.twitter}>
                        <Twitter className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Naši partneri</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Surađujemo s vodećim kompanijama i institucijama
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 max-w-4xl mx-auto">
          {['Infobip', 'Rimac', 'FER Zagreb', 'HUP', 'HAMAG-BICRO', 'Croatian Makers'].map((partner) => (
            <div key={partner} className="text-xl font-bold text-gray-400">
              {partner}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Building className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">
            Želite surađivati s nama?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Bilo da ste tvrtka koja traži obuku za zaposlenike ili instruktor koji želi
            dijeliti znanje, rado ćemo surađivati.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/help/contact">
                <Mail className="h-4 w-4 mr-2" />
                Kontaktirajte nas
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/become-instructor">
                Postanite instruktor
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import api from '@/lib/api'
import {
  GraduationCap,
  DollarSign,
  Users,
  Globe,
  Video,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  BookOpen,
  BarChart,
  Headphones,
  Clock,
  Star,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const BENEFITS = [
  {
    icon: DollarSign,
    title: 'Zarađujte dijeleći znanje',
    description: 'Dobijte 70% prihoda od svakog prodanog tečaja. Bez limita na zaradu.',
  },
  {
    icon: Globe,
    title: 'Globalni doseg',
    description: 'Vaši tečajevi dostupni su studentima iz cijelog svijeta, 24/7.',
  },
  {
    icon: Video,
    title: 'Produkcijska podrška',
    description: 'Pomažemo s snimanjem, montažom i tehničkim aspektima produkcije.',
  },
  {
    icon: BarChart,
    title: 'Analitika i uvidi',
    description: 'Detaljni izvještaji o prodaji, angažmanu i povratnim informacijama studenata.',
  },
  {
    icon: Headphones,
    title: 'Podrška za instruktore',
    description: 'Dedicirani tim za podršku i zajednica instruktora.',
  },
  {
    icon: TrendingUp,
    title: 'Gradite svoj brand',
    description: 'Povećajte svoju vidljivost i autoritet u industriji.',
  },
]

const REQUIREMENTS = [
  'Stručnost u području koje želite predavati',
  'Kvalitetna oprema za snimanje (kamera, mikrofon)',
  'Sposobnost jasnog komuniciranja složenih koncepata',
  'Posvećenost ažuriranju sadržaja',
  'Minimalno 2 sata sadržaja po tečaju',
]

const STATS = [
  { value: '150+', label: 'Aktivnih instruktora' },
  { value: '€2M+', label: 'Isplaćeno instruktorima' },
  { value: '50,000+', label: 'Studenata' },
  { value: '95%', label: 'Zadovoljstvo' },
]

const EXPERTISE_AREAS = [
  'Programiranje',
  'Web razvoj',
  'Mobilni razvoj',
  'Data Science',
  'Dizajn',
  'Marketing',
  'Poslovanje',
  'Osobni razvoj',
  'Jezici',
  'Ostalo',
]

export default function BecomeInstructorPage() {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    expertise: '',
    experience: '',
    linkedIn: '',
    portfolio: '',
    courseIdea: '',
    audience: '',
    motivation: '',
    agreedToTerms: false,
  })

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/instructor-applications', data)
      return response.data.data
    },
    onSuccess: () => {
      setSubmitted(true)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMutation.mutate(formData)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Prijava je poslana!</h2>
            <p className="text-gray-600 mb-6">
              Hvala na interesu! Naš tim će pregledati vašu prijavu i javiti vam se
              unutar 5 radnih dana.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/">Početna</Link>
              </Button>
              <Button asChild>
                <Link href="/courses">Pregledaj tečajeve</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <Badge className="bg-white/20 text-white mb-4">
            <GraduationCap className="h-3 w-3 mr-1" />
            Postanite instruktor
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Podijelite svoje znanje sa svijetom
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
            Pridružite se zajednici stručnjaka koji zarađuju dijeleći svoje znanje
            s tisućama motiviranih studenata.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="#application">
              Prijavite se danas
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {STATS.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          Zašto predavati na EduPlatforma?
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Pružamo sve što vam treba za uspjeh kao online instruktor
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Kako postati instruktor?</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Prijavite se', description: 'Ispunite prijavu i recite nam o svojoj stručnosti' },
                { step: 2, title: 'Odobrenje', description: 'Naš tim pregledava prijave i odabire kandidate' },
                { step: 3, title: 'Kreirajte tečaj', description: 'Snimite i objavite svoj prvi tečaj uz našu podršku' },
                { step: 4, title: 'Zarađujte', description: 'Počnite zarađivati od prvog dana prodaje' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Što tražimo?</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {REQUIREMENTS.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Form */}
      <div id="application" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Prijavite se</h2>
            <p className="text-gray-600 text-center mb-8">
              Ispunite formu i naš tim će vas kontaktirati
            </p>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Ime i prezime *
                      </label>
                      <Input
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Vaše ime"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Email *
                      </label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="vas@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Područje stručnosti *
                    </label>
                    <Select
                      value={formData.expertise}
                      onValueChange={(value) =>
                        setFormData({ ...formData, expertise: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberite područje" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERTISE_AREAS.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Radno iskustvo *
                    </label>
                    <Textarea
                      required
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      placeholder="Opišite vaše radno iskustvo i kvalifikacije u odabranom području..."
                      rows={3}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        LinkedIn profil
                      </label>
                      <Input
                        value={formData.linkedIn}
                        onChange={(e) =>
                          setFormData({ ...formData, linkedIn: e.target.value })
                        }
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Portfolio / Web stranica
                      </label>
                      <Input
                        value={formData.portfolio}
                        onChange={(e) =>
                          setFormData({ ...formData, portfolio: e.target.value })
                        }
                        placeholder="www.vasa-stranica.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Ideja za tečaj *
                    </label>
                    <Textarea
                      required
                      value={formData.courseIdea}
                      onChange={(e) =>
                        setFormData({ ...formData, courseIdea: e.target.value })
                      }
                      placeholder="Opišite tečaj koji biste htjeli kreirati. Koja je tema, što će studenti naučiti?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Ciljna publika *
                    </label>
                    <Input
                      required
                      value={formData.audience}
                      onChange={(e) =>
                        setFormData({ ...formData, audience: e.target.value })
                      }
                      placeholder="Tko su vaši idealni studenti? (npr. početnici, profesionalci...)"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Motivacija
                    </label>
                    <Textarea
                      value={formData.motivation}
                      onChange={(e) =>
                        setFormData({ ...formData, motivation: e.target.value })
                      }
                      placeholder="Zašto želite postati instruktor na EduPlatforma?"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, agreedToTerms: checked as boolean })
                      }
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      Slažem se s{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        uvjetima korištenja
                      </Link>{' '}
                      i{' '}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        politikom privatnosti
                      </Link>
                      .
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={
                      submitMutation.isPending ||
                      !formData.expertise ||
                      !formData.agreedToTerms
                    }
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Slanje...
                      </>
                    ) : (
                      <>
                        Pošalji prijavu
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-purple-50 border-purple-200">
          <CardContent className="pt-8 text-center">
            <Star className="h-8 w-8 text-yellow-400 mx-auto mb-4" />
            <p className="text-lg italic text-gray-700 mb-6">
              "Postati instruktor na EduPlatforma bila je jedna od najboljih odluka u mojoj karijeri.
              Ne samo da sam povećao prihode, već sam izgradio zajednicu studenata koji cijene moj rad."
            </p>
            <div className="font-semibold">Ivan Novak</div>
            <div className="text-sm text-gray-600">
              Senior Developer, Instruktor s 10,000+ studenata
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

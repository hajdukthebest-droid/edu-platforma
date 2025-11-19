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
import api from '@/lib/api'
import {
  Building2,
  Users,
  BarChart3,
  Shield,
  CheckCircle,
  ArrowRight,
  Zap,
  Award,
  Clock,
  Globe,
  HeadphonesIcon,
  Lock,
  Target,
  TrendingUp,
  BookOpen,
  Loader2,
} from 'lucide-react'

const BENEFITS = [
  {
    icon: Users,
    title: 'Centralizirano upravljanje',
    description: 'Upravljajte svim korisnicima, licencama i napretkom s jednog mjesta.',
  },
  {
    icon: BarChart3,
    title: 'Detaljna analitika',
    description: 'Pratite ROI obrazovanja s naprednim izvještajima i metrikama.',
  },
  {
    icon: Shield,
    title: 'SSO & Sigurnost',
    description: 'Integracija s vašim identity providerom i napredne sigurnosne opcije.',
  },
  {
    icon: Target,
    title: 'Prilagođeni sadržaj',
    description: 'Kreirajte vlastite tečajeve i learning pathove za vaš tim.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Prioritetna podrška',
    description: 'Dedicirani account manager i 24/7 tehnička podrška.',
  },
  {
    icon: Lock,
    title: 'GDPR usklađenost',
    description: 'Potpuna usklađenost s europskim propisima o zaštiti podataka.',
  },
]

const PLANS = [
  {
    name: 'Team',
    users: '5-25 korisnika',
    price: 'Od 15€/korisnik/mj',
    features: [
      'Pristup svim tečajevima',
      'Osnovna analitika',
      'Email podrška',
      'Admin dashboard',
    ],
  },
  {
    name: 'Business',
    users: '26-100 korisnika',
    price: 'Od 12€/korisnik/mj',
    popular: true,
    features: [
      'Sve iz Team plana',
      'Napredna analitika',
      'Prioritetna podrška',
      'SSO integracija',
      'Prilagođeni sadržaj',
    ],
  },
  {
    name: 'Enterprise',
    users: '100+ korisnika',
    price: 'Kontaktirajte nas',
    features: [
      'Sve iz Business plana',
      'Dedicirani account manager',
      'Custom integracije',
      'On-premise opcija',
      'SLA garancija',
    ],
  },
]

const LOGOS = ['Infobip', 'Rimac', 'Span', 'Nanobit', 'Photomath', 'Agrivi']

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 zaposlenika' },
  { value: '11-50', label: '11-50 zaposlenika' },
  { value: '51-200', label: '51-200 zaposlenika' },
  { value: '201-500', label: '201-500 zaposlenika' },
  { value: '500+', label: '500+ zaposlenika' },
]

export default function EnterprisePage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    companySize: '',
    message: '',
  })

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/enterprise/contact', data)
      return response.data
    },
    onSuccess: () => {
      setSubmitted(true)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMutation.mutate(formData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-blue-600 text-white mb-4">
              <Building2 className="h-3 w-3 mr-1" />
              Enterprise
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Obučite svoj tim za uspjeh
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Skalabilno rješenje za korporativno obrazovanje. Povećajte produktivnost
              i zadovoljstvo zaposlenika s EduPlatforma Business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="#contact">
                  Zatražite demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Pogledajte planove
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By */}
      <div className="bg-white py-12 border-b">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-6">
            TVRTKE KOJE NAM VJERUJU
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {LOGOS.map((logo) => (
              <span key={logo} className="text-xl font-bold text-gray-300">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: '94%', label: 'Stopa završetka tečaja' },
            { value: '3.2x', label: 'ROI u prvoj godini' },
            { value: '50%', label: 'Smanjenje troškova obuke' },
            { value: '89%', label: 'Zadovoljstvo zaposlenika' },
          ].map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Zašto EduPlatforma Business?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sve što trebate za uspješno korporativno obrazovanje
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Planovi i cijene</h2>
          <p className="text-gray-600">
            Fleksibilni planovi prilagođeni potrebama vašeg tima
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, index) => (
            <Card
              key={index}
              className={plan.popular ? 'border-blue-500 border-2' : ''}
            >
              {plan.popular && (
                <div className="text-center py-2 bg-blue-500 text-white text-sm font-medium">
                  Najpopularniji
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.users}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-2xl font-bold">{plan.price}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <a href="#contact">Kontaktirajte nas</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Detail */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Sve što trebate za uspješnu obuku
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Bogata knjižnica sadržaja
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 500+ tečajeva iz IT-a, biznisa i soft skills</li>
                  <li>• Novi sadržaji svaki mjesec</li>
                  <li>• Sadržaj na hrvatskom i engleskom</li>
                  <li>• Mogućnost dodavanja vlastitog sadržaja</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Napredna analitika
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Real-time praćenje napretka</li>
                  <li>• Izvještaji po timovima i odjelima</li>
                  <li>• ROI kalkulacije</li>
                  <li>• Izvoz podataka i integracije</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Sigurnost i usklađenost
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• SSO (SAML, OAuth)</li>
                  <li>• GDPR i SOC 2 usklađenost</li>
                  <li>• Enkripcija podataka</li>
                  <li>• Redoviti sigurnosni auditi</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <HeadphonesIcon className="h-5 w-5 text-blue-600" />
                  Premium podrška
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Dedicirani account manager</li>
                  <li>• Onboarding i trening</li>
                  <li>• 24/7 tehnička podrška</li>
                  <li>• Quarterly business reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div id="contact" className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Zatražite demo</h2>
            <p className="text-gray-600">
              Ispunite formu i naš tim će vas kontaktirati unutar 24 sata
            </p>
          </div>

          {submitted ? (
            <Card className="text-center">
              <CardContent className="py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hvala na interesu!</h3>
                <p className="text-gray-600">
                  Naš tim će vas kontaktirati u najkraćem mogućem roku.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Naziv tvrtke *
                      </label>
                      <Input
                        required
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({ ...formData, companyName: e.target.value })
                        }
                        placeholder="Vaša tvrtka d.o.o."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Veličina tvrtke *
                      </label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) =>
                          setFormData({ ...formData, companySize: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Odaberite" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Ime i prezime *
                      </label>
                      <Input
                        required
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({ ...formData, contactName: e.target.value })
                        }
                        placeholder="Vaše ime"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Poslovni email *
                      </label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="ime@tvrtka.hr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Telefon
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+385 xx xxx xxxx"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Kako vam možemo pomoći?
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Opišite vaše potrebe..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitMutation.isPending || !formData.companySize}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Slanje...
                      </>
                    ) : (
                      <>
                        Zatražite demo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

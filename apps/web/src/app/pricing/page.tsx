'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import api from '@/lib/api'
import {
  Check,
  X,
  Zap,
  Star,
  Crown,
  HelpCircle,
  ArrowRight,
  Users,
  BookOpen,
  Award,
  MessageSquare,
  Download,
  Video,
  Clock,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'free',
    name: 'Besplatno',
    description: 'Idealno za početak',
    icon: BookOpen,
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    features: [
      { name: 'Pristup besplatnim tečajevima', included: true },
      { name: '5 besplatnih lekcija mjesečno', included: true },
      { name: 'Osnovna podrška', included: true },
      { name: 'Pristup forumu', included: true },
      { name: 'Certifikati', included: false },
      { name: 'Preuzimanje materijala', included: false },
      { name: 'Pristup live sesijama', included: false },
      { name: 'Prioritetna podrška', included: false },
    ],
    cta: 'Započni besplatno',
    ctaVariant: 'outline' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Za ozbiljne studente',
    icon: Zap,
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    popular: true,
    features: [
      { name: 'Pristup svim tečajevima', included: true },
      { name: 'Neograničene lekcije', included: true },
      { name: 'Email podrška', included: true },
      { name: 'Pristup forumu', included: true },
      { name: 'Certifikati', included: true },
      { name: 'Preuzimanje materijala', included: true },
      { name: 'Pristup live sesijama', included: true },
      { name: 'Prioritetna podrška', included: false },
    ],
    cta: 'Započni Pro',
    ctaVariant: 'default' as const,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Za profesionalce',
    icon: Crown,
    monthlyPrice: 49.99,
    yearlyPrice: 499.99,
    popular: false,
    features: [
      { name: 'Pristup svim tečajevima', included: true },
      { name: 'Neograničene lekcije', included: true },
      { name: '1-na-1 mentorstvo', included: true },
      { name: 'Pristup forumu', included: true },
      { name: 'Certifikati', included: true },
      { name: 'Preuzimanje materijala', included: true },
      { name: 'Pristup live sesijama', included: true },
      { name: 'Prioritetna podrška 24/7', included: true },
    ],
    cta: 'Započni Premium',
    ctaVariant: 'outline' as const,
  },
]

const COMPARISON_FEATURES = [
  { name: 'Pristup tečajevima', free: '5 besplatnih', pro: 'Svi', premium: 'Svi + ekskluzivni' },
  { name: 'Video kvaliteta', free: '720p', pro: '1080p', premium: '4K' },
  { name: 'Certifikati', free: false, pro: true, premium: true },
  { name: 'Preuzimanje', free: false, pro: true, premium: true },
  { name: 'Live sesije', free: false, pro: true, premium: true },
  { name: 'Forum pristup', free: true, pro: true, premium: true },
  { name: 'Podrška', free: 'Email', pro: 'Prioritetna', premium: '24/7 Chat' },
  { name: 'Mentorstvo', free: false, pro: false, premium: '4h mjesečno' },
]

const FAQ = [
  {
    question: 'Mogu li otkazati pretplatu u bilo kojem trenutku?',
    answer: 'Da, možete otkazati pretplatu u bilo kojem trenutku. Zadržat ćete pristup do kraja obračunskog razdoblja.',
  },
  {
    question: 'Što se događa s mojim napretkom ako otkažem?',
    answer: 'Vaš napredak i certifikati ostaju sačuvani. Ako se ponovno pretplatite, nastavit ćete gdje ste stali.',
  },
  {
    question: 'Postoji li probno razdoblje?',
    answer: 'Pro i Premium planovi imaju 7 dana probnog razdoblja. Možete otkazati bez naplate.',
  },
  {
    question: 'Mogu li promijeniti plan?',
    answer: 'Da, možete nadograditi ili smanjiti plan u bilo kojem trenutku. Razlika u cijeni bit će proporcionalno obračunata.',
  },
  {
    question: 'Koje načine plaćanja prihvaćate?',
    answer: 'Prihvaćamo sve glavne kreditne kartice (Visa, Mastercard, American Express), PayPal i bankovni prijenos.',
  },
  {
    question: 'Postoji li popust za godišnje plaćanje?',
    answer: 'Da, uštedite do 17% s godišnjim plaćanjem u odnosu na mjesečno.',
  },
]

export default function PricingPage() {
  const { user } = useAuth()
  const [isYearly, setIsYearly] = useState(false)

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.post('/subscriptions/checkout', {
        planId,
        interval: isYearly ? 'yearly' : 'monthly',
      })
      return response.data.data
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
  })

  const handleSubscribe = (planId: string) => {
    if (!user) {
      window.location.href = `/login?redirect=/pricing`
      return
    }
    if (planId === 'free') {
      window.location.href = '/dashboard'
      return
    }
    subscribeMutation.mutate(planId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="bg-white/20 text-white mb-4">
            <Star className="h-3 w-3 mr-1" />
            Najpovoljnije cijene
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Odaberite plan koji vam odgovara
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Investirajte u svoje obrazovanje. Pristupite stotinama tečajeva i stručnim instruktorima.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn('text-sm', !isYearly && 'text-white font-medium')}>
              Mjesečno
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-white"
            />
            <span className={cn('text-sm', isYearly && 'text-white font-medium')}>
              Godišnje
              <Badge className="ml-2 bg-green-500 text-white text-xs">
                -17%
              </Badge>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative',
                  plan.popular && 'border-blue-500 border-2 shadow-lg'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      Najpopularniji
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3',
                    plan.id === 'free' && 'bg-gray-100',
                    plan.id === 'pro' && 'bg-blue-100',
                    plan.id === 'premium' && 'bg-purple-100'
                  )}>
                    <Icon className={cn(
                      'h-6 w-6',
                      plan.id === 'free' && 'text-gray-600',
                      plan.id === 'pro' && 'text-blue-600',
                      plan.id === 'premium' && 'text-purple-600'
                    )} />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      {price === 0 ? 'Besplatno' : `${price.toFixed(2)}€`}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-500">
                        /{isYearly ? 'god' : 'mj'}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 text-sm text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={!feature.included ? 'text-gray-400' : ''}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.ctaVariant}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribeMutation.isPending}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Usporedba planova
        </h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4">Značajka</th>
                <th className="text-center py-4 px-4">Besplatno</th>
                <th className="text-center py-4 px-4 bg-blue-50">Pro</th>
                <th className="text-center py-4 px-4">Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((feature, index) => (
                <tr key={index} className="border-b">
                  <td className="py-4 px-4 font-medium">{feature.name}</td>
                  <td className="text-center py-4 px-4">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm">{feature.free}</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4 bg-blue-50">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm font-medium">{feature.pro}</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {typeof feature.premium === 'boolean' ? (
                      feature.premium ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm">{feature.premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Zašto odabrati EduPlatforma?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">HD Video sadržaj</h3>
              <p className="text-sm text-gray-600">
                Visokokvalitetne video lekcije s profesionalnom produkcijom
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Priznati certifikati</h3>
              <p className="text-sm text-gray-600">
                Dobijte certifikate koje poslodavci cijene
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Zajednica studenata</h3>
              <p className="text-sm text-gray-600">
                Povežite se s tisućama drugih studenata
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Učite vlastitim tempom</h3>
              <p className="text-sm text-gray-600">
                Pristupite sadržaju 24/7, učite kad vam odgovara
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto bg-green-50 border-green-200">
          <CardContent className="py-8 text-center">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">30 dana garancije povrata novca</h3>
            <p className="text-gray-600">
              Niste zadovoljni? Vratit ćemo vam novac, bez pitanja. Vaše zadovoljstvo je naš prioritet.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Česta pitanja
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Spremni za početak?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Pridružite se tisućama studenata koji već uče na EduPlatforma. Započnite besplatno!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link href="/courses">
                Pregledaj tečajeve
              </Link>
            </Button>
            <Button size="lg" onClick={() => handleSubscribe('pro')}>
              Započni Pro probno razdoblje
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

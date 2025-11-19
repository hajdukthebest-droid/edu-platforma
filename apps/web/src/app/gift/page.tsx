'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
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
  Gift,
  CreditCard,
  Mail,
  Calendar,
  Heart,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Star,
  Sparkles,
  Send,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const GIFT_AMOUNTS = [
  { value: '25', label: '25€' },
  { value: '50', label: '50€' },
  { value: '100', label: '100€' },
  { value: '150', label: '150€' },
  { value: '200', label: '200€' },
  { value: 'custom', label: 'Vlastiti iznos' },
]

const OCCASIONS = [
  { value: 'birthday', label: 'Rođendan', emoji: '🎂' },
  { value: 'graduation', label: 'Diploma', emoji: '🎓' },
  { value: 'christmas', label: 'Božić', emoji: '🎄' },
  { value: 'thank-you', label: 'Zahvala', emoji: '🙏' },
  { value: 'encouragement', label: 'Podrška', emoji: '💪' },
  { value: 'other', label: 'Drugo', emoji: '🎁' },
]

export default function GiftPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    type: 'card', // 'card' or 'course'
    amount: '50',
    customAmount: '',
    recipientName: '',
    recipientEmail: '',
    senderName: user ? `${user.firstName} ${user.lastName}` : '',
    message: '',
    occasion: 'birthday',
    deliveryDate: '',
    courseId: '',
  })

  // Fetch popular courses for gifting
  const { data: courses } = useQuery({
    queryKey: ['gift-courses'],
    queryFn: async () => {
      const response = await api.get('/courses?sort=popular&limit=6')
      return response.data.data
    },
  })

  // Purchase gift mutation
  const purchaseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/gifts/purchase', data)
      return response.data.data
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      } else {
        setSubmitted(true)
      }
    },
  })

  const handleSubmit = () => {
    if (!user) {
      window.location.href = `/login?redirect=/gift`
      return
    }
    purchaseMutation.mutate(formData)
  }

  const finalAmount = formData.amount === 'custom'
    ? parseFloat(formData.customAmount) || 0
    : parseFloat(formData.amount)

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Poklon je poslan!</h2>
            <p className="text-gray-600 mb-6">
              {formData.recipientName} će primiti poklon na email {formData.recipientEmail}
              {formData.deliveryDate && ` na datum ${formData.deliveryDate}`}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/dashboard">Moj račun</Link>
              </Button>
              <Button asChild>
                <Link href="/gift">Pošalji još jedan</Link>
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
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="bg-white/20 text-white mb-4">
            <Gift className="h-3 w-3 mr-1" />
            Pokloni
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Poklonite znanje
          </h1>
          <p className="text-xl text-pink-100 max-w-2xl mx-auto">
            Darujte poklon koji stvarno znači. Pomozite nekome da nauči nove vještine
            i ostvari svoje ciljeve.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Steps Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Choose Type */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className={`cursor-pointer transition-all ${
                  formData.type === 'card'
                    ? 'ring-2 ring-purple-600'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setFormData({ ...formData, type: 'card' })}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Poklon kartica</h3>
                  <p className="text-gray-600 mb-4">
                    Odaberite iznos, a primatelj može sam odabrati tečajeve
                  </p>
                  <ul className="text-sm text-left space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Fleksibilan izbor
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Nikad ne istječe
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Kombiniraj s drugim karticama
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  formData.type === 'course'
                    ? 'ring-2 ring-purple-600'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setFormData({ ...formData, type: 'course' })}
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Specifičan tečaj</h3>
                  <p className="text-gray-600 mb-4">
                    Odaberite konkretni tečaj koji želite pokloniti
                  </p>
                  <ul className="text-sm text-left space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Personalizirani poklon
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Odmah dostupno
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Doživotni pristup
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="md:col-span-2 text-center">
                <Button size="lg" onClick={() => setStep(2)}>
                  Nastavi
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Configure Gift */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {formData.type === 'card' ? 'Odaberite iznos' : 'Odaberite tečaj'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.type === 'card' ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {GIFT_AMOUNTS.map((amount) => (
                        <Button
                          key={amount.value}
                          variant={formData.amount === amount.value ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, amount: amount.value })}
                        >
                          {amount.label}
                        </Button>
                      ))}
                    </div>
                    {formData.amount === 'custom' && (
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          Unesite iznos (€)
                        </label>
                        <Input
                          type="number"
                          min="10"
                          max="500"
                          value={formData.customAmount}
                          onChange={(e) =>
                            setFormData({ ...formData, customAmount: e.target.value })
                          }
                          placeholder="50"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(courses || []).map((course: any) => (
                      <Card
                        key={course.id}
                        className={`cursor-pointer ${
                          formData.courseId === course.id
                            ? 'ring-2 ring-purple-600'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setFormData({ ...formData, courseId: course.id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {course.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {course.price?.toFixed(2)}€
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Prigoda
                  </label>
                  <Select
                    value={formData.occasion}
                    onValueChange={(value) => setFormData({ ...formData, occasion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OCCASIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.emoji} {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Natrag
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Nastavi
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Recipient Details */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Podaci o primatelju</CardTitle>
                <CardDescription>
                  Unesite podatke osobe kojoj šaljete poklon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Ime primatelja *
                    </label>
                    <Input
                      value={formData.recipientName}
                      onChange={(e) =>
                        setFormData({ ...formData, recipientName: e.target.value })
                      }
                      placeholder="Ime i prezime"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Email primatelja *
                    </label>
                    <Input
                      type="email"
                      value={formData.recipientEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, recipientEmail: e.target.value })
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Vaše ime (pošiljatelj)
                  </label>
                  <Input
                    value={formData.senderName}
                    onChange={(e) =>
                      setFormData({ ...formData, senderName: e.target.value })
                    }
                    placeholder="Vaše ime"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Osobna poruka
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Napišite osobnu poruku..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Datum dostave (opcionalno)
                  </label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryDate: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ostavite prazno za odmah slanje
                  </p>
                </div>

                {/* Summary */}
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Sažetak</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Tip poklona:</span>
                        <span>{formData.type === 'card' ? 'Poklon kartica' : 'Tečaj'}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Iznos:</span>
                        <span>{finalAmount.toFixed(2)}€</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Natrag
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.recipientName ||
                      !formData.recipientEmail ||
                      purchaseMutation.isPending
                    }
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {purchaseMutation.isPending ? 'Obrada...' : 'Kupi i pošalji'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold">Instant dostava</h4>
              <p className="text-sm text-gray-600">
                Poklon stiže odmah na email
              </p>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <h4 className="font-semibold">Osobna poruka</h4>
              <p className="text-sm text-gray-600">
                Dodajte vlastitu čestitku
              </p>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-semibold">Nikad ne istječe</h4>
              <p className="text-sm text-gray-600">
                Poklon kartica nema rok trajanja
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

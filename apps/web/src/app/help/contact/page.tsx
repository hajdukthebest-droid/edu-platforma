'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import {
  ArrowLeft,
  Mail,
  Send,
  CheckCircle,
  Clock,
  MessageSquare,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const SUPPORT_TOPICS = [
  { value: 'general', label: 'Opći upit' },
  { value: 'technical', label: 'Tehnički problem' },
  { value: 'billing', label: 'Plaćanje i refundacija' },
  { value: 'course', label: 'Pitanje o tečaju' },
  { value: 'account', label: 'Problem s računom' },
  { value: 'feedback', label: 'Povratna informacija' },
  { value: 'other', label: 'Ostalo' },
]

export default function ContactSupportPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    topic: '',
    subject: '',
    message: '',
    courseId: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/support/tickets', data)
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
            <h2 className="text-2xl font-bold mb-2">Upit je poslan!</h2>
            <p className="text-gray-600 mb-6">
              Hvala što ste nas kontaktirali. Odgovorit ćemo vam što je prije moguće, obično unutar 24 sata.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail className="h-4 w-4" />
                <span>Potvrda je poslana na:</span>
              </div>
              <div className="font-medium">{formData.email}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/help">Natrag na Pomoć</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/dashboard">Idi na Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/help">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na Centar pomoći
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Kontaktirajte podršku</h1>
          <p className="text-gray-600">
            Opišite vaš problem i odgovorit ćemo vam što je prije moguće
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Pošaljite upit</CardTitle>
                <CardDescription>
                  Ispunite formu ispod i naš tim za podršku će vam odgovoriti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Ime i prezime *
                      </label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Vaše ime"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Email adresa *
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
                      Tema upita *
                    </label>
                    <Select
                      value={formData.topic}
                      onValueChange={(value) =>
                        setFormData({ ...formData, topic: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberite temu" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORT_TOPICS.map((topic) => (
                          <SelectItem key={topic.value} value={topic.value}>
                            {topic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Naslov *
                    </label>
                    <Input
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Kratko opišite vaš problem"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Poruka *
                    </label>
                    <Textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Detaljno opišite vaš upit ili problem. Što više detalja navedete, to ćemo brže moći riješiti vaš problem."
                    />
                  </div>

                  {submitMutation.isError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Došlo je do greške. Molimo pokušajte ponovno.
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitMutation.isPending || !formData.topic}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Slanje...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Pošalji upit
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Response time */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Vrijeme odgovora</div>
                    <div className="text-sm text-gray-600">Unutar 24 sata</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Naš tim za podršku radi od ponedjeljka do petka, 9:00 - 17:00.
                </p>
              </CardContent>
            </Card>

            {/* Direct email */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Email podrška</div>
                    <div className="text-sm text-blue-600">
                      support@eduplatforma.hr
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Za hitne upite možete nas kontaktirati direktno emailom.
                </p>
              </CardContent>
            </Card>

            {/* FAQ reminder */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Česta pitanja</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Možda već imamo odgovor na vaše pitanje u našoj FAQ sekciji.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/help/faq">Pregledaj FAQ</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">Savjeti za brži odgovor</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Navedite naziv tečaja ako se radi o specifičnom problemu
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Opišite korake koje ste poduzeli prije nego se problem pojavio
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Uključite screenshot ako je moguće
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Navedite preglednik i uređaj koji koristite
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

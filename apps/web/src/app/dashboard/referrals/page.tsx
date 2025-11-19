'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import api from '@/lib/api'
import {
  Users,
  Gift,
  Copy,
  Check,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  UserPlus,
  Share2,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  ExternalLink,
  Clock,
  Award,
} from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useAuth } from '@/contexts/AuthContext'

const COMMISSION_RATE = 0.2 // 20% commission
const MIN_PAYOUT = 50 // Minimum EUR for payout

export default function ReferralDashboardPage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  // Fetch referral stats
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const response = await api.get('/referrals/stats')
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch referral history
  const { data: referrals } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const response = await api.get('/referrals')
      return response.data.data
    },
    enabled: !!user,
  })

  const referralCode = referralData?.code || user?.id?.slice(0, 8).toUpperCase()
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referralCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    const text = encodeURIComponent('Pridruži se EduPlatforma i počni učiti! Koristi moj kod za popust:')
    const url = encodeURIComponent(referralLink)

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=Pridruži se EduPlatforma&body=${text} ${referralLink}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank')
    }
  }

  const stats = referralData || {
    totalReferrals: 0,
    activeReferrals: 0,
    pendingEarnings: 0,
    totalEarnings: 0,
    conversionRate: 0,
    thisMonth: 0,
  }

  const payoutProgress = (stats.pendingEarnings / MIN_PAYOUT) * 100

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Referalni program</h1>
              <p className="text-gray-600">
                Pozovite prijatelje i zaradite {COMMISSION_RATE * 100}% od njihove prve kupnje
              </p>
            </div>
            <div className="hidden md:block">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Gift className="h-4 w-4 mr-2" />
                {COMMISSION_RATE * 100}% komisije
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Referral Link Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Vaš referalni link
            </CardTitle>
            <CardDescription>
              Podijelite ovaj link s prijateljima i zaradite komisiju
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleCopyLink} variant="outline">
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Ili koristite kod: <span className="font-mono font-bold">{referralCode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className="ml-1 h-6 px-1"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('facebook')}
                  title="Podijeli na Facebook"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('twitter')}
                  title="Podijeli na Twitter"
                >
                  <Twitter className="h-4 w-4 text-sky-500" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('linkedin')}
                  title="Podijeli na LinkedIn"
                >
                  <Linkedin className="h-4 w-4 text-blue-700" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('email')}
                  title="Pošalji emailom"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ukupno referala</p>
                  <p className="text-3xl font-bold">{stats.totalReferrals}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.thisMonth} ovaj mjesec
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktivni korisnici</p>
                  <p className="text-3xl font-bold">{stats.activeReferrals}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.conversionRate}% konverzija
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Na čekanju</p>
                  <p className="text-3xl font-bold">{stats.pendingEarnings.toFixed(2)}€</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Min. {MIN_PAYOUT}€ za isplatu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ukupna zarada</p>
                  <p className="text-3xl font-bold">{stats.totalEarnings.toFixed(2)}€</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Isplaćeno
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payout Progress */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Napredak do isplate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{stats.pendingEarnings.toFixed(2)}€</span>
                      <span>{MIN_PAYOUT}€</span>
                    </div>
                    <Progress value={Math.min(payoutProgress, 100)} className="h-3" />
                  </div>

                  {payoutProgress >= 100 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-700">Možete zatražiti isplatu!</p>
                      <Button className="mt-3" size="sm">
                        Zatraži isplatu
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      Još {(MIN_PAYOUT - stats.pendingEarnings).toFixed(2)}€ do minimalne isplate
                    </p>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Kako funkcionira</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                        <span>Podijelite svoj referalni link</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                        <span>Prijatelj se registrira i kupi tečaj</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                        <span>Zarađujete {COMMISSION_RATE * 100}% od kupnje</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>
                        <span>Isplata kada dosegnete {MIN_PAYOUT}€</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Povijest referala</CardTitle>
                <CardDescription>
                  Pregled svih vaših referala i zarada
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referrals && referrals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Korisnik</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Zarada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.map((referral: any) => (
                        <TableRow key={referral.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">
                                  {referral.user.firstName[0]}
                                  {referral.user.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {referral.user.firstName} {referral.user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {referral.user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(referral.createdAt), 'dd.MM.yyyy', { locale: hr })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                referral.status === 'PAID'
                                  ? 'default'
                                  : referral.status === 'PENDING'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {referral.status === 'PAID'
                                ? 'Isplaćeno'
                                : referral.status === 'PENDING'
                                ? 'Na čekanju'
                                : 'Registriran'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {referral.earnings > 0 ? `${referral.earnings.toFixed(2)}€` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">Još nema referala</h3>
                    <p className="text-gray-500 mb-4">
                      Podijelite svoj referalni link i počnite zarađivati
                    </p>
                    <Button onClick={handleCopyLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Kopiraj link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Česta pitanja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Koliko mogu zaraditi?</h4>
                <p className="text-sm text-gray-600">
                  Zarađujete {COMMISSION_RATE * 100}% od prve kupnje svakog korisnika koji se registrira putem vašeg linka. Nema limita na broj referala!
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Kada dobivam isplatu?</h4>
                <p className="text-sm text-gray-600">
                  Isplate se vrše mjesečno kada dosegnete minimalni iznos od {MIN_PAYOUT}€. Možete zatražiti isplatu putem PayPal-a ili bankovnog transfera.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Koliko dugo vrijedi moj link?</h4>
                <p className="text-sm text-gray-600">
                  Vaš referalni link nikad ne istječe. Korisnik će biti povezan s vama 30 dana nakon što klikne na link.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Što moj prijatelj dobiva?</h4>
                <p className="text-sm text-gray-600">
                  Korisnici koji se registriraju putem referalnog linka dobivaju 10% popusta na prvu kupnju.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

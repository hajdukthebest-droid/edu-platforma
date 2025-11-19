'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  BookOpen,
  Users,
  PiggyBank,
  Banknote,
  ArrowUpRight,
  Wallet,
} from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'
import { useAuth } from '@/contexts/AuthContext'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const MIN_PAYOUT = 50 // Minimum EUR for payout

export default function InstructorEarningsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [period, setPeriod] = useState('30')
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState('bank')
  const [payoutDetails, setPayoutDetails] = useState('')

  // Fetch earnings data
  const { data: earnings, isLoading } = useQuery({
    queryKey: ['instructor-earnings', period],
    queryFn: async () => {
      const response = await api.get(`/instructor/earnings?period=${period}`)
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch transactions
  const { data: transactions } = useQuery({
    queryKey: ['instructor-transactions'],
    queryFn: async () => {
      const response = await api.get('/instructor/transactions')
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch payout history
  const { data: payouts } = useQuery({
    queryKey: ['instructor-payouts'],
    queryFn: async () => {
      const response = await api.get('/instructor/payouts')
      return response.data.data
    },
    enabled: !!user,
  })

  // Request payout mutation
  const payoutMutation = useMutation({
    mutationFn: async (data: { method: string; details: string }) => {
      const response = await api.post('/instructor/payouts/request', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-earnings'] })
      queryClient.invalidateQueries({ queryKey: ['instructor-payouts'] })
      setShowPayoutDialog(false)
      setPayoutDetails('')
    },
  })

  const handleRequestPayout = () => {
    payoutMutation.mutate({
      method: payoutMethod,
      details: payoutDetails,
    })
  }

  const stats = earnings || {
    totalEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalWithdrawn: 0,
    totalSales: 0,
    periodEarnings: 0,
    periodChange: 0,
    chartData: [],
    topCourses: [],
  }

  const payoutProgress = (stats.availableBalance / MIN_PAYOUT) * 100

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
            <Link href="/instructor">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na Instructor Panel
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Zarada i isplate</h1>
              <p className="text-gray-600">
                Pratite svoju zaradu i zatražite isplatu
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Zadnjih 7 dana</SelectItem>
                  <SelectItem value="30">Zadnjih 30 dana</SelectItem>
                  <SelectItem value="90">Zadnja 3 mjeseca</SelectItem>
                  <SelectItem value="365">Zadnjih godinu dana</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Izvoz
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dostupni saldo</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.availableBalance.toFixed(2)}€
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={Math.min(payoutProgress, 100)} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {payoutProgress >= 100
                    ? 'Možete zatražiti isplatu'
                    : `Još ${(MIN_PAYOUT - stats.availableBalance).toFixed(2)}€ do isplate`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ukupna zarada</p>
                  <p className="text-3xl font-bold">{stats.totalEarnings.toFixed(2)}€</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                {stats.periodChange >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">+{stats.periodChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">{stats.periodChange}%</span>
                  </>
                )}
                <span className="text-gray-500">u odnosu na prethodno razdoblje</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Na čekanju</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.pendingBalance.toFixed(2)}€
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Sredstva dostupna nakon 14 dana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ukupno isplaćeno</p>
                  <p className="text-3xl font-bold">{stats.totalWithdrawn.toFixed(2)}€</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Banknote className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.totalSales} prodaja ukupno
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Earnings Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Zarada po danima</CardTitle>
                <CardDescription>
                  Pregled zarade za odabrano razdoblje
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.chartData && stats.chartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => [`${value.toFixed(2)}€`, 'Zarada']}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#3B82F6"
                          fill="#93C5FD"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nema podataka za odabrano razdoblje
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Nedavne transakcije</CardTitle>
                <CardDescription>
                  Pregled prodaja i naknada
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tečaj</TableHead>
                        <TableHead>Kupac</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead className="text-right">Iznos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 10).map((tx: any) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="font-medium">{tx.course?.title}</div>
                          </TableCell>
                          <TableCell>
                            {tx.user?.firstName} {tx.user?.lastName}
                          </TableCell>
                          <TableCell>
                            {format(new Date(tx.createdAt), 'dd.MM.yyyy', { locale: hr })}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            +{tx.instructorEarnings.toFixed(2)}€
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    Nema transakcija
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payout Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zatražite isplatu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {stats.availableBalance.toFixed(2)}€
                  </div>
                  <p className="text-sm text-gray-500">dostupno za isplatu</p>
                </div>

                <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      disabled={stats.availableBalance < MIN_PAYOUT}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Zatraži isplatu
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Zatraži isplatu</DialogTitle>
                      <DialogDescription>
                        Odaberite način isplate i unesite potrebne podatke
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Iznos za isplatu
                        </label>
                        <div className="text-2xl font-bold text-green-600">
                          {stats.availableBalance.toFixed(2)}€
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Način isplate
                        </label>
                        <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank">Bankovni prijenos</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {payoutMethod === 'bank' ? 'IBAN' : 'PayPal email'}
                        </label>
                        <Input
                          value={payoutDetails}
                          onChange={(e) => setPayoutDetails(e.target.value)}
                          placeholder={
                            payoutMethod === 'bank'
                              ? 'HR1234567890123456789'
                              : 'vas@email.com'
                          }
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowPayoutDialog(false)}
                      >
                        Odustani
                      </Button>
                      <Button
                        onClick={handleRequestPayout}
                        disabled={!payoutDetails || payoutMutation.isPending}
                      >
                        {payoutMutation.isPending ? 'Slanje...' : 'Potvrdi zahtjev'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Minimalni iznos za isplatu: {MIN_PAYOUT}€
                </p>
              </CardContent>
            </Card>

            {/* Top Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Najbolji tečajevi</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topCourses && stats.topCourses.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topCourses.map((course: any, index: number) => (
                      <div key={course.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {course.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {course.sales} prodaja
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {course.earnings.toFixed(2)}€
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nema podataka o prodaji
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Payout History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Povijest isplata</CardTitle>
              </CardHeader>
              <CardContent>
                {payouts && payouts.length > 0 ? (
                  <div className="space-y-3">
                    {payouts.slice(0, 5).map((payout: any) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {payout.amount.toFixed(2)}€
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(payout.createdAt), 'dd.MM.yyyy', {
                              locale: hr,
                            })}
                          </div>
                        </div>
                        <Badge
                          variant={
                            payout.status === 'COMPLETED'
                              ? 'default'
                              : payout.status === 'PENDING'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {payout.status === 'COMPLETED' && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {payout.status === 'PENDING' && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {payout.status === 'REJECTED' && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {payout.status === 'COMPLETED'
                            ? 'Isplaćeno'
                            : payout.status === 'PENDING'
                            ? 'Na čekanju'
                            : 'Odbijeno'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nema prethodnih isplata
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Kako funkcionira?</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    Dobivate 70% od svake prodaje
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    Sredstva su dostupna 14 dana nakon kupnje
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    Isplate se procesuiraju unutar 5 radnih dana
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    Minimalni iznos za isplatu je {MIN_PAYOUT}€
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

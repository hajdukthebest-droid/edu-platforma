'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { User, Award, TrendingUp, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    profession: '',
    organization: '',
  })

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/profile')
      const userData = response.data.data
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        bio: userData.bio || '',
        profession: userData.profession || '',
        organization: userData.organization || '',
      })
      return userData
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.put('/auth/profile', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setIsEditing(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Moj profil</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistika</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user.totalPoints}</div>
                    <div className="text-sm text-gray-600">Ukupno bodova</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user.level}</div>
                    <div className="text-sm text-gray-600">Razina</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user.currentStreak}</div>
                    <div className="text-sm text-gray-600">Dnevni niz</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Član od</div>
                    <div className="text-sm text-gray-600">{formatDate(user.createdAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Osnovne informacije</CardTitle>
                    <CardDescription>Vaši osobni podaci</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      Uredi
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Ime</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={e =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Prezime</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email} disabled />
                      <p className="text-xs text-gray-500">Email se ne može mijenjati</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">Zanimanje</Label>
                      <Input
                        id="profession"
                        value={formData.profession}
                        onChange={e => setFormData({ ...formData, profession: e.target.value })}
                        placeholder="npr. Farmaceut"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organizacija</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={e =>
                          setFormData({ ...formData, organization: e.target.value })
                        }
                        placeholder="npr. Ljekarna Zagreb"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">O meni</Label>
                      <textarea
                        id="bio"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Napišite nešto o sebi..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Spremanje...' : 'Spremi promjene'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Odustani
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Ime i prezime</Label>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Email</Label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-600">Uloga</Label>
                      <p className="font-medium">{user.role}</p>
                    </div>

                    {user.profession && (
                      <div>
                        <Label className="text-gray-600">Zanimanje</Label>
                        <p className="font-medium">{user.profession}</p>
                      </div>
                    )}

                    {user.organization && (
                      <div>
                        <Label className="text-gray-600">Organizacija</Label>
                        <p className="font-medium">{user.organization}</p>
                      </div>
                    )}

                    {user.bio && (
                      <div>
                        <Label className="text-gray-600">O meni</Label>
                        <p className="font-medium whitespace-pre-wrap">{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

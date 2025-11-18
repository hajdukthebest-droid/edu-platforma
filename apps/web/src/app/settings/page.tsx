'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Bell,
  Shield,
  Palette,
  BookOpen,
  Globe,
  Camera,
  Save,
  Mail,
  Lock,
  Trash2,
} from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()

  // Profile form state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    website: '',
    linkedin: '',
    twitter: '',
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNewCourse: true,
    emailCourseUpdates: true,
    emailAchievements: true,
    emailWeeklyDigest: true,
    emailMarketing: false,
    pushEnabled: true,
    pushAchievements: true,
    pushMessages: true,
    pushReminders: true,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showProgress: true,
    showAchievements: true,
    showCertificates: true,
    allowMessages: true,
  })

  // Learning preferences
  const [learning, setLearning] = useState({
    dailyGoalMinutes: 15,
    dailyGoalLessons: 1,
    preferredLanguage: 'hr',
    autoplayVideos: true,
    showSubtitles: true,
    playbackSpeed: '1',
  })

  // Load user data
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
      })
    }
  }, [user])

  // Load preferences
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      try {
        const response = await api.get('/profile/preferences')
        return response.data.data
      } catch {
        return null
      }
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (preferences) {
      if (preferences.notifications) {
        setNotifications(preferences.notifications)
      }
      if (preferences.privacy) {
        setPrivacy(preferences.privacy)
      }
      if (preferences.learning) {
        setLearning(preferences.learning)
      }
    }
  }, [preferences])

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profile) => {
      const response = await api.put('/profile', data)
      return response.data.data
    },
    onSuccess: (data) => {
      updateUser(data)
      toast.success('Profil uspješno ažuriran')
    },
    onError: () => {
      toast.error('Greška pri ažuriranju profila')
    },
  })

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: typeof notifications) => {
      await api.put('/profile/preferences', { notifications: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] })
      toast.success('Postavke obavijesti spremljene')
    },
  })

  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: typeof privacy) => {
      await api.put('/profile/preferences', { privacy: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] })
      toast.success('Postavke privatnosti spremljene')
    },
  })

  const updateLearningMutation = useMutation({
    mutationFn: async (data: typeof learning) => {
      await api.put('/profile/preferences', { learning: data })
      // Also update streak goals
      await api.put('/dashboard/goals', {
        dailyGoalMinutes: data.dailyGoalMinutes,
        dailyGoalLessons: data.dailyGoalLessons,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] })
      queryClient.invalidateQueries({ queryKey: ['user-streak'] })
      toast.success('Postavke učenja spremljene')
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrebna prijava</h2>
            <p className="text-gray-600 mb-6">
              Morate biti prijavljeni da biste pristupili postavkama.
            </p>
            <Button asChild>
              <Link href="/login">Prijava</Link>
            </Button>
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
          <h1 className="text-3xl font-bold">Postavke</h1>
          <p className="text-gray-600 mt-1">Upravljajte svojim računom i postavkama</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Obavijesti</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privatnost</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Učenje</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Račun</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profil</CardTitle>
                <CardDescription>Uredite svoje javne informacije</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Promijeni sliku
                  </Button>
                </div>

                <Separator />

                {/* Name */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ime</Label>
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prezime</Label>
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label>Biografija</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Recite nešto o sebi..."
                    rows={4}
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h4 className="font-medium">Društvene mreže</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Web stranica</Label>
                      <Input
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn</Label>
                      <Input
                        value={profile.linkedin}
                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => updateProfileMutation.mutate(profile)}
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Spremanje...' : 'Spremi promjene'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Postavke obavijesti</CardTitle>
                <CardDescription>Kontrolirajte kako primati obavijesti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email obavijesti
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Novi tečajevi</p>
                        <p className="text-sm text-gray-500">Obavijesti o novim tečajevima</p>
                      </div>
                      <Switch
                        checked={notifications.emailNewCourse}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, emailNewCourse: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Ažuriranja tečajeva</p>
                        <p className="text-sm text-gray-500">Obavijesti o promjenama u upisanim tečajevima</p>
                      </div>
                      <Switch
                        checked={notifications.emailCourseUpdates}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, emailCourseUpdates: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Postignuća</p>
                        <p className="text-sm text-gray-500">Obavijesti o novim postignućima</p>
                      </div>
                      <Switch
                        checked={notifications.emailAchievements}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, emailAchievements: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tjedni sažetak</p>
                        <p className="text-sm text-gray-500">Tjedni pregled vašeg napretka</p>
                      </div>
                      <Switch
                        checked={notifications.emailWeeklyDigest}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, emailWeeklyDigest: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing</p>
                        <p className="text-sm text-gray-500">Promotivne ponude i novosti</p>
                      </div>
                      <Switch
                        checked={notifications.emailMarketing}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, emailMarketing: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Push Notifications */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Push obavijesti
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Omogući push obavijesti</p>
                        <p className="text-sm text-gray-500">Primajte obavijesti u pregledniku</p>
                      </div>
                      <Switch
                        checked={notifications.pushEnabled}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, pushEnabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Poruke</p>
                        <p className="text-sm text-gray-500">Obavijesti o novim porukama</p>
                      </div>
                      <Switch
                        checked={notifications.pushMessages}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, pushMessages: checked })
                        }
                        disabled={!notifications.pushEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Podsjetnici</p>
                        <p className="text-sm text-gray-500">Podsjetnici za učenje</p>
                      </div>
                      <Switch
                        checked={notifications.pushReminders}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, pushReminders: checked })
                        }
                        disabled={!notifications.pushEnabled}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => updateNotificationsMutation.mutate(notifications)}
                  disabled={updateNotificationsMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateNotificationsMutation.isPending ? 'Spremanje...' : 'Spremi postavke'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Postavke privatnosti</CardTitle>
                <CardDescription>Kontrolirajte što drugi mogu vidjeti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Javni profil</p>
                      <p className="text-sm text-gray-500">Dopusti drugima da vide vaš profil</p>
                    </div>
                    <Switch
                      checked={privacy.profilePublic}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, profilePublic: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Prikaži napredak</p>
                      <p className="text-sm text-gray-500">Prikaži napredak u tečajevima na profilu</p>
                    </div>
                    <Switch
                      checked={privacy.showProgress}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, showProgress: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Prikaži postignuća</p>
                      <p className="text-sm text-gray-500">Prikaži postignuća na profilu</p>
                    </div>
                    <Switch
                      checked={privacy.showAchievements}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, showAchievements: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Prikaži certifikate</p>
                      <p className="text-sm text-gray-500">Prikaži certifikate na profilu</p>
                    </div>
                    <Switch
                      checked={privacy.showCertificates}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, showCertificates: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dopusti poruke</p>
                      <p className="text-sm text-gray-500">Dopusti drugima da vam šalju poruke</p>
                    </div>
                    <Switch
                      checked={privacy.allowMessages}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, allowMessages: checked })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={() => updatePrivacyMutation.mutate(privacy)}
                  disabled={updatePrivacyMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updatePrivacyMutation.isPending ? 'Spremanje...' : 'Spremi postavke'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning">
            <Card>
              <CardHeader>
                <CardTitle>Postavke učenja</CardTitle>
                <CardDescription>Prilagodite iskustvo učenja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Daily Goals */}
                <div>
                  <h4 className="font-medium mb-4">Dnevni ciljevi</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minuta dnevno</Label>
                      <Select
                        value={learning.dailyGoalMinutes.toString()}
                        onValueChange={(v) =>
                          setLearning({ ...learning, dailyGoalMinutes: parseInt(v) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minuta</SelectItem>
                          <SelectItem value="10">10 minuta</SelectItem>
                          <SelectItem value="15">15 minuta</SelectItem>
                          <SelectItem value="30">30 minuta</SelectItem>
                          <SelectItem value="60">60 minuta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Lekcija dnevno</Label>
                      <Select
                        value={learning.dailyGoalLessons.toString()}
                        onValueChange={(v) =>
                          setLearning({ ...learning, dailyGoalLessons: parseInt(v) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 lekcija</SelectItem>
                          <SelectItem value="2">2 lekcije</SelectItem>
                          <SelectItem value="3">3 lekcije</SelectItem>
                          <SelectItem value="5">5 lekcija</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Video Preferences */}
                <div>
                  <h4 className="font-medium mb-4">Video postavke</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Automatska reprodukcija</p>
                        <p className="text-sm text-gray-500">Automatski pokreni sljedeći video</p>
                      </div>
                      <Switch
                        checked={learning.autoplayVideos}
                        onCheckedChange={(checked) =>
                          setLearning({ ...learning, autoplayVideos: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Titlovi</p>
                        <p className="text-sm text-gray-500">Prikaži titlove kada su dostupni</p>
                      </div>
                      <Switch
                        checked={learning.showSubtitles}
                        onCheckedChange={(checked) =>
                          setLearning({ ...learning, showSubtitles: checked })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Brzina reprodukcije</Label>
                      <Select
                        value={learning.playbackSpeed}
                        onValueChange={(v) =>
                          setLearning({ ...learning, playbackSpeed: v })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="0.75">0.75x</SelectItem>
                          <SelectItem value="1">1x</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="2">2x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => updateLearningMutation.mutate(learning)}
                  disabled={updateLearningMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateLearningMutation.isPending ? 'Spremanje...' : 'Spremi postavke'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Email */}
              <Card>
                <CardHeader>
                  <CardTitle>Email adresa</CardTitle>
                  <CardDescription>Vaša email adresa za prijavu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Input value={user.email} disabled className="max-w-md" />
                    <Button variant="outline">Promijeni</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Lozinka</CardTitle>
                  <CardDescription>Promijenite svoju lozinku</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Promijeni lozinku
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Opasna zona</CardTitle>
                  <CardDescription>Nepovratne akcije</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Obriši račun
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Ova akcija je nepovratna. Svi vaši podaci će biti trajno izbrisani.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

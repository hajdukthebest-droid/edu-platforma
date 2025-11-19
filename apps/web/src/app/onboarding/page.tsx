'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import {
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  BookOpen,
  Target,
  User,
  Sparkles,
  Clock,
  CheckCircle,
  Briefcase,
  Code,
  PenTool,
  LineChart,
  Rocket,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'welcome', title: 'Dobrodošli' },
  { id: 'interests', title: 'Interesi' },
  { id: 'goals', title: 'Ciljevi' },
  { id: 'profile', title: 'Profil' },
  { id: 'complete', title: 'Završetak' },
]

const INTEREST_TOPICS = [
  { id: 'programming', label: 'Programiranje', icon: Code },
  { id: 'design', label: 'Dizajn', icon: PenTool },
  { id: 'business', label: 'Poslovanje', icon: Briefcase },
  { id: 'marketing', label: 'Marketing', icon: LineChart },
  { id: 'data-science', label: 'Data Science', icon: LineChart },
  { id: 'languages', label: 'Jezici', icon: BookOpen },
]

const LEARNING_GOALS = [
  { id: 'career', label: 'Napredak u karijeri', description: 'Želim steći vještine za bolje radno mjesto' },
  { id: 'hobby', label: 'Osobni razvoj', description: 'Učim iz hobija i znatiželje' },
  { id: 'certification', label: 'Certifikati', description: 'Trebam službene certifikate' },
  { id: 'startup', label: 'Pokretanje posla', description: 'Pripremam se za vlastiti projekt' },
]

const TIME_COMMITMENT = [
  { id: '15', label: '15 min/dan', description: 'Lagano tempom' },
  { id: '30', label: '30 min/dan', description: 'Umjereno' },
  { id: '60', label: '1 sat/dan', description: 'Intenzivno' },
  { id: '120', label: '2+ sata/dan', description: 'Maksimalno' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    interests: [] as string[],
    goal: '',
    timeCommitment: '30',
    firstName: '',
    lastName: '',
    bio: '',
  })

  // Fetch categories for recommendations
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories')
      return response.data.data
    },
  })

  // Fetch recommended courses based on interests
  const { data: recommendations } = useQuery({
    queryKey: ['onboarding-recommendations', formData.interests],
    queryFn: async () => {
      const response = await api.get('/courses', {
        params: { limit: 3, featured: true },
      })
      return response.data.data?.courses || []
    },
    enabled: currentStep === 4,
  })

  // Save onboarding preferences
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Save user preferences
      await api.put('/users/preferences', {
        learningGoal: data.goal,
        dailyGoal: parseInt(data.timeCommitment),
        interests: data.interests,
      })

      // Update profile if provided
      if (data.firstName || data.lastName || data.bio) {
        await api.put('/users/profile', {
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
        })
      }

      // Mark onboarding as complete
      await api.post('/users/complete-onboarding')
    },
    onSuccess: () => {
      router.push('/dashboard')
    },
  })

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    saveMutation.mutate(formData)
  }

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }))
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Korak {currentStep + 1} od {STEPS.length}</span>
            <span>{STEPS[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-xl">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Dobrodošli na EduPlatforma!</CardTitle>
                <CardDescription className="text-lg">
                  Prilagodimo vam iskustvo učenja u samo par koraka
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Personalizirani tečajevi</p>
                  </div>
                  <div className="p-4">
                    <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Fleksibilno učenje</p>
                  </div>
                  <div className="p-4">
                    <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Certifikati</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Traje samo 2 minute! Pomoći će nam da vam preporučimo najbolje tečajeve.
                </p>
              </CardContent>
            </>
          )}

          {/* Step 1: Interests */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Koji vas teme zanimaju?</CardTitle>
                <CardDescription>
                  Odaberite jednu ili više tema koje vas zanimaju
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {INTEREST_TOPICS.map((topic) => {
                    const isSelected = formData.interests.includes(topic.id)
                    const Icon = topic.icon
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleInterest(topic.id)}
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-all',
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Icon className={cn(
                          'h-6 w-6 mb-2',
                          isSelected ? 'text-blue-600' : 'text-gray-400'
                        )} />
                        <span className={cn(
                          'font-medium',
                          isSelected && 'text-blue-700'
                        )}>
                          {topic.label}
                        </span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-blue-600 absolute top-2 right-2" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Koji je vaš glavni cilj?</CardTitle>
                <CardDescription>
                  Pomažemo vam da postignete ono što vam je važno
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {LEARNING_GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setFormData({ ...formData, goal: goal.id })}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 text-left transition-all',
                        formData.goal === goal.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="font-medium">{goal.label}</div>
                      <div className="text-sm text-gray-600">{goal.description}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium mb-3">Koliko vremena možete posvetiti učenju?</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_COMMITMENT.map((time) => (
                      <button
                        key={time.id}
                        onClick={() => setFormData({ ...formData, timeCommitment: time.id })}
                        className={cn(
                          'p-3 rounded-lg border-2 text-center transition-all',
                          formData.timeCommitment === time.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="font-medium">{time.label}</div>
                        <div className="text-xs text-gray-500">{time.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Profile */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Dovršite svoj profil</CardTitle>
                <CardDescription>
                  Ovi podaci su opcionalni, ali pomažu u personalizaciji
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Ime</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Vaše ime"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Prezime</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Vaše prezime"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">O meni</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Kratko opišite sebe i svoje interese..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Rocket className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Sve je spremno!</CardTitle>
                <CardDescription>
                  Na temelju vaših odabira, preporučujemo vam ove tečajeve
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium mb-2">Vaše postavke</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interesi:</span>
                      <span>
                        {formData.interests.length > 0
                          ? formData.interests.map(i =>
                              INTEREST_TOPICS.find(t => t.id === i)?.label
                            ).join(', ')
                          : 'Nisu odabrani'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cilj:</span>
                      <span>
                        {LEARNING_GOALS.find(g => g.id === formData.goal)?.label || 'Nije odabran'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dnevni cilj:</span>
                      <span>
                        {TIME_COMMITMENT.find(t => t.id === formData.timeCommitment)?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommended courses */}
                {recommendations && recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Preporučeni tečajevi za vas</h4>
                    <div className="space-y-2">
                      {recommendations.slice(0, 3).map((course: any) => (
                        <div
                          key={course.id}
                          className="p-3 border rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-sm">{course.title}</div>
                            <div className="text-xs text-gray-500">{course.level}</div>
                          </div>
                          <Badge variant="outline">{course.category?.name}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <CardFooter className="flex justify-between pt-6 border-t">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Natrag
              </Button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Dalje
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Spremanje...' : 'Započni učenje'}
                <Rocket className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Skip option */}
        {currentStep < STEPS.length - 1 && (
          <div className="text-center mt-4">
            <Button
              variant="link"
              onClick={() => router.push('/dashboard')}
              className="text-gray-500"
            >
              Preskoči za sada
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

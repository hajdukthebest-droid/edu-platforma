import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Award, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Dobrodošli u budućnost učenja
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Premium e-learning platforma za farmaceutsku i zdravstvenu industriju.
              AI-powered personalizacija, gamification i stručno znanje na jednom mjestu.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Započni besplatno</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                <Link href="/courses">Pregledaj tečajeve</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Zašto odabrati Edu Platformu?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kombiniramo najbolje tehnologije s ekspertnim znanjem kako bi vam pružili
              nezaboravno iskustvo učenja
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Stručni sadržaji</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tečajevi kreirani od stručnjaka iz farmaceutske industrije s aktualnim znanjem
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>CPD/CME bodovi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Akreditirani tečajevi s bodovima za trajno usavršavanje
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Zajednica</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Uči i surađuj s tisućama profesionalaca iz industrije
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Napredak</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Prati svoj napredak, osvajaj bodove i badges
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Spreman za početak?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Pridruži se tisućama profesionalaca koji već koriste našu platformu
          </p>
          <Button asChild size="lg">
            <Link href="/register">Kreiraj besplatan račun</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Edu Platforma. Sva prava pridržana.</p>
        </div>
      </footer>
    </div>
  )
}

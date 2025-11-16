import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Award, Users, TrendingUp, ArrowRight, BookOpen } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6">
              Dobrodošli u budućnost učenja
            </h1>
            <p className="text-2xl mb-4 text-blue-100">
              Sveobuhvatna multi-domain e-learning platforma
            </p>
            <p className="text-xl mb-10 text-blue-200">
              15 različitih područja, 180+ kategorija, tisuće tečajeva
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg py-6 px-8">
                <Link href="/domains">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Odaberi područje
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 text-lg py-6 px-8">
                <Link href="/courses">Pregledaj sve tečajeve</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Preview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Odaberite svoje područje</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Od tehnologije do zdravstva, od marketinga do umjetnosti - pronađite savršene tečajeve za vas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            {[
              { icon: '💻', name: 'Tehnologija i IT', color: '#3B82F6' },
              { icon: '🏥', name: 'Zdravstvo', color: '#10B981' },
              { icon: '💼', name: 'Poslovanje', color: '#8B5CF6' },
              { icon: '📣', name: 'Marketing', color: '#EC4899' },
              { icon: '💰', name: 'Financije', color: '#F59E0B' },
              { icon: '🎨', name: 'Dizajn', color: '#EF4444' },
              { icon: '🌍', name: 'Jezici', color: '#06B6D4' },
              { icon: '🌱', name: 'Osobni Razvoj', color: '#84CC16' },
              { icon: '🔬', name: 'Znanost', color: '#6366F1' },
              { icon: '⚖️', name: 'Pravo', color: '#14B8A6' },
            ].map((domain, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 mx-auto group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: domain.color + '15' }}
                  >
                    {domain.icon}
                  </div>
                  <p className="font-semibold text-sm">{domain.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/domains">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Pogledaj sva područja
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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

'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ArrowLeft,
  Search,
  BookOpen,
  CreditCard,
  Award,
  Settings,
  HelpCircle,
  PlayCircle,
} from 'lucide-react'

const FAQ_DATA = [
  {
    category: 'getting-started',
    label: 'Početak rada',
    icon: PlayCircle,
    questions: [
      {
        id: 'create-account',
        question: 'Kako kreirati račun?',
        answer: 'Kliknite na "Registracija" u gornjem desnom kutu stranice. Unesite vaš email, lozinku i osnovne podatke. Primit ćete email za potvrdu - kliknite na link u emailu da aktivirate račun.',
      },
      {
        id: 'enroll',
        question: 'Kako se prijaviti na tečaj?',
        answer: 'Pronađite tečaj koji vas zanima, kliknite na njega za više detalja, a zatim kliknite "Upis" ili "Kupi tečaj". Za besplatne tečajeve, odmah ćete dobiti pristup. Za plaćene tečajeve, bit ćete preusmjereni na stranicu za plaćanje.',
      },
      {
        id: 'first-lesson',
        question: 'Kako započeti prvu lekciju?',
        answer: 'Nakon upisa, idite na svoj Dashboard i kliknite na tečaj. Vidjet ćete listu modula i lekcija - kliknite na prvu lekciju da započnete učenje. Vaš napredak će se automatski spremati.',
      },
      {
        id: 'forgot-password',
        question: 'Zaboravio/la sam lozinku',
        answer: 'Na stranici za prijavu kliknite "Zaboravljena lozinka?". Unesite email adresu i poslat ćemo vam link za resetiranje lozinke. Link vrijedi 24 sata.',
      },
    ],
  },
  {
    category: 'courses',
    label: 'Tečajevi i učenje',
    icon: BookOpen,
    questions: [
      {
        id: 'access-course',
        question: 'Koliko dugo imam pristup tečaju?',
        answer: 'Nakon kupnje, imate doživotni pristup tečaju. Možete ga pregledavati neograničen broj puta, u svoje vrijeme, bez vremenskog ograničenja.',
      },
      {
        id: 'progress-save',
        question: 'Da li se moj napredak sprema?',
        answer: 'Da, vaš napredak se automatski sprema. Možete nastaviti s učenjem u bilo kojem trenutku, na bilo kojem uređaju, točno tamo gdje ste stali.',
      },
      {
        id: 'video-issues',
        question: 'Zašto se video ne učitava?',
        answer: 'Provjerite vašu internet vezu. Pokušajte osvježiti stranicu ili očistiti cache preglednika. Ako problem i dalje postoji, pokušajte s drugim preglednikom ili kontaktirajte podršku.',
      },
      {
        id: 'download-materials',
        question: 'Mogu li preuzeti materijale?',
        answer: 'Dodatni materijali (PDF-ovi, vježbe, resursi) mogu se preuzeti direktno iz lekcije. Kliknite na ikonu preuzimanja pored svakog priloga. Video lekcije nisu dostupne za preuzimanje.',
      },
      {
        id: 'mobile-learning',
        question: 'Mogu li učiti na mobitelu?',
        answer: 'Da, naša platforma je potpuno responzivna i prilagođena za mobilne uređaje. Možete učiti na računalu, tabletu ili mobitelu.',
      },
    ],
  },
  {
    category: 'billing',
    label: 'Plaćanje i pretplate',
    icon: CreditCard,
    questions: [
      {
        id: 'payment-methods',
        question: 'Koje načine plaćanja prihvaćate?',
        answer: 'Prihvaćamo sve glavne kreditne i debitne kartice (Visa, Mastercard, Maestro) putem sigurnog Stripe sustava. Također podržavamo PayPal.',
      },
      {
        id: 'refund',
        question: 'Mogu li dobiti povrat novca?',
        answer: 'Da, nudimo 30-dnevnu garanciju povrata novca za sve tečajeve. Ako niste zadovoljni, kontaktirajte podršku unutar 30 dana od kupnje s razlogom nezadovoljstva.',
      },
      {
        id: 'invoice',
        question: 'Kako dobiti račun?',
        answer: 'Račun se automatski šalje na vaš email nakon uspješne kupnje. Također ga možete pronaći u sekciji "Povijest plaćanja" na vašem profilu.',
      },
      {
        id: 'promo-code',
        question: 'Kako koristiti promo kod?',
        answer: 'Na stranici za plaćanje, unesite promo kod u polje "Promo kod" i kliknite "Primijeni". Popust će se automatski obračunati na ukupnu cijenu.',
      },
      {
        id: 'secure-payment',
        question: 'Je li plaćanje sigurno?',
        answer: 'Da, koristimo Stripe - vodeći globalni sustav za online plaćanja. Sve transakcije su enkriptirane i zaštićene SSL certifikatom. Nikada ne spremamo podatke vaše kartice.',
      },
    ],
  },
  {
    category: 'certificates',
    label: 'Certifikati i postignuća',
    icon: Award,
    questions: [
      {
        id: 'certificate',
        question: 'Kako preuzeti certifikat?',
        answer: 'Nakon što završite sve lekcije u tečaju, certifikat će se automatski generirati. Možete ga pronaći u sekciji "Certifikati" na vašem profilu. Dostupan je za preuzimanje u PDF formatu.',
      },
      {
        id: 'certificate-validity',
        question: 'Je li certifikat valjan?',
        answer: 'Naši certifikati potvrđuju da ste uspješno završili tečaj i stekli određene vještine. Svaki certifikat ima jedinstveni broj koji poslodavci mogu verificirati.',
      },
      {
        id: 'share-certificate',
        question: 'Kako podijeliti certifikat?',
        answer: 'Na stranici certifikata kliknite "Podijeli" i odaberite platformu (LinkedIn, Twitter, Facebook). Također možete kopirati javni link na certifikat.',
      },
      {
        id: 'achievements',
        question: 'Što su postignuća i bodovi?',
        answer: 'Postignuća su nagrade za vaš napredak - završene lekcije, kvizove, nizove učenja. Bodovi se akumuliraju i određuju vašu razinu na platformi.',
      },
    ],
  },
  {
    category: 'account',
    label: 'Postavke računa',
    icon: Settings,
    questions: [
      {
        id: 'change-email',
        question: 'Kako promijeniti email adresu?',
        answer: 'Idite u Postavke > Račun i kliknite "Promijeni email". Unesite novu email adresu i potvrdite trenutnu lozinku. Primit ćete verifikacijski email na novu adresu.',
      },
      {
        id: 'change-password',
        question: 'Kako promijeniti lozinku?',
        answer: 'Idite u Postavke > Račun i kliknite "Promijeni lozinku". Unesite trenutnu lozinku i novu lozinku dva puta za potvrdu.',
      },
      {
        id: 'delete-account',
        question: 'Kako obrisati račun?',
        answer: 'Idite u Postavke > Račun i kliknite "Obriši račun". Ova akcija je nepovratna - izgubiti ćete pristup svim tečajevima i certifikatima. Razmislite o deaktiviranju umjesto brisanja.',
      },
      {
        id: 'privacy-settings',
        question: 'Kako podesiti privatnost?',
        answer: 'Idite u Postavke > Privatnost gdje možete kontrolirati vidljivost profila, postignuća i da li drugi korisnici mogu vidjeti vašu aktivnost.',
      },
    ],
  },
  {
    category: 'technical',
    label: 'Tehnička podrška',
    icon: HelpCircle,
    questions: [
      {
        id: 'supported-browsers',
        question: 'Koji preglednici su podržani?',
        answer: 'Preporučujemo Chrome, Firefox, Safari ili Edge u najnovijim verzijama. Internet Explorer nije podržan. Za najbolje iskustvo, ažurirajte preglednik na najnoviju verziju.',
      },
      {
        id: 'video-quality',
        question: 'Mogu li promijeniti kvalitetu videa?',
        answer: 'Da, na video playeru kliknite ikonu zupčanika i odaberite željenu kvalitetu. Niža kvaliteta troši manje interneta, viša daje bolju sliku.',
      },
      {
        id: 'playback-speed',
        question: 'Mogu li promijeniti brzinu reprodukcije?',
        answer: 'Da, kliknite na brzinu reprodukcije na video playeru (npr. "1x") i odaberite željenu brzinu od 0.5x do 2x.',
      },
      {
        id: 'contact-support',
        question: 'Kako kontaktirati podršku?',
        answer: 'Možete nas kontaktirati putem forme na stranici Pomoć > Kontakt ili direktno na support@eduplatforma.hr. Odgovaramo unutar 24 sata.',
      },
    ],
  },
]

export default function FaqPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')

  const [searchQuery, setSearchQuery] = useState(searchParam || '')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')

  // Filter questions based on search and category
  const filteredFaq = FAQ_DATA.map((category) => ({
    ...category,
    questions: category.questions.filter((q) => {
      const matchesSearch = searchQuery
        ? q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        : true
      const matchesCategory =
        selectedCategory === 'all' || category.category === selectedCategory
      return matchesSearch && matchesCategory
    }),
  })).filter((category) => category.questions.length > 0)

  const totalQuestions = filteredFaq.reduce(
    (acc, cat) => acc + cat.questions.length,
    0
  )

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
          <h1 className="text-3xl font-bold mb-2">Često postavljana pitanja</h1>
          <p className="text-gray-600">
            Pronađite odgovore na najčešća pitanja
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Kategorije</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 p-4 pt-0">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Sve kategorije
                  </button>
                  {FAQ_DATA.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.category}
                        onClick={() => setSelectedCategory(category.category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          selectedCategory === category.category
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pretražite pitanja..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-2">
                  Pronađeno {totalQuestions} rezultata za &quot;{searchQuery}&quot;
                </p>
              )}
            </div>

            {/* FAQ Accordion */}
            {filteredFaq.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nema rezultata</h3>
                  <p className="text-gray-500 mb-4">
                    Pokušajte s drugim pojmom za pretraživanje
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Očisti pretragu
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredFaq.map((category) => (
                  <Card key={category.category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {(() => {
                          const Icon = category.icon
                          return <Icon className="h-5 w-5" />
                        })()}
                        {category.label}
                        <Badge variant="secondary" className="ml-2">
                          {category.questions.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        {category.questions.map((faq) => (
                          <AccordionItem key={faq.id} value={faq.id} id={faq.id}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Still need help */}
            <Card className="mt-8">
              <CardContent className="py-6 text-center">
                <h3 className="font-semibold mb-2">
                  Niste pronašli odgovor?
                </h3>
                <p className="text-gray-600 mb-4">
                  Kontaktirajte našu podršku i odgovorit ćemo vam u roku 24 sata.
                </p>
                <Button asChild>
                  <Link href="/help/contact">Kontaktiraj podršku</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

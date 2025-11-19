import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Accessibility, Mail } from 'lucide-react'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na početnu
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Accessibility className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Izjava o pristupačnosti</h1>
              <p className="text-gray-600">Zadnje ažuriranje: 1. siječnja 2024.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="prose prose-gray max-w-none pt-6">
              <h2>Naša obveza prema pristupačnosti</h2>
              <p>
                EduPlatforma je posvećena osiguravanju digitalne pristupačnosti za osobe
                s invaliditetom. Kontinuirano poboljšavamo korisničko iskustvo za sve i
                primjenjujemo relevantne standarde pristupačnosti.
              </p>

              <h2>Standardi usklađenosti</h2>
              <p>
                Nastojimo se pridržavati WCAG 2.1 smjernica na razini AA (Web Content
                Accessibility Guidelines). Ove smjernice objašnjavaju kako web sadržaj
                učiniti pristupačnijim osobama s invaliditetom.
              </p>

              <h2>Mjere pristupačnosti</h2>
              <p>
                Poduzimamo sljedeće mjere kako bismo osigurali pristupačnost EduPlatforma:
              </p>
              <ul>
                <li>Uključujemo pristupačnost u naše interne politike</li>
                <li>Pružamo obuku o pristupačnosti za osoblje</li>
                <li>Dodjeljujemo jasne ciljeve pristupačnosti i odgovornosti</li>
                <li>Koristimo formalne metode kontrole kvalitete pristupačnosti</li>
              </ul>

              <h2>Značajke pristupačnosti</h2>
              <p>
                Naša platforma uključuje sljedeće značajke pristupačnosti:
              </p>
              <ul>
                <li>
                  <strong>Navigacija tipkovnicom</strong> - Sve funkcionalnosti su dostupne
                  putem tipkovnice
                </li>
                <li>
                  <strong>Alternativni tekst</strong> - Slike imaju opisni alt tekst
                </li>
                <li>
                  <strong>Kontrast boja</strong> - Osiguravamo dovoljan kontrast između
                  teksta i pozadine
                </li>
                <li>
                  <strong>Responzivni dizajn</strong> - Stranica se prilagođava različitim
                  veličinama zaslona
                </li>
                <li>
                  <strong>Oznake obrazaca</strong> - Svi obrasci imaju jasne oznake i
                  upute
                </li>
                <li>
                  <strong>Video titlovi</strong> - Video sadržaji imaju titlove na
                  hrvatskom jeziku
                </li>
                <li>
                  <strong>Čitljivi fontovi</strong> - Koristimo čitljive fontove i
                  primjerene veličine teksta
                </li>
                <li>
                  <strong>Jasna struktura</strong> - Koristimo semantički HTML i logičnu
                  strukturu naslova
                </li>
              </ul>

              <h2>Poznata ograničenja</h2>
              <p>
                Unatoč našim naporima, neki sadržaji mogu imati ograničenja pristupačnosti:
              </p>
              <ul>
                <li>
                  Stariji video sadržaji možda nemaju titlove - radimo na njihovom
                  dodavanju
                </li>
                <li>
                  Neki PDF dokumenti možda nisu potpuno pristupačni - pretvaramo ih u
                  pristupačne formate
                </li>
                <li>
                  Sadržaj koji generiraju korisnici (forum, komentari) možda ne
                  zadovoljava sve standarde
                </li>
              </ul>

              <h2>Povratne informacije</h2>
              <p>
                Cijenimo vaše povratne informacije o pristupačnosti EduPlatforma. Ako
                naiđete na prepreke pristupačnosti, molimo kontaktirajte nas:
              </p>
              <ul>
                <li>Email: pristupacnost@eduplatforma.hr</li>
                <li>Telefon: +385 1 234 5678</li>
                <li>Kontakt obrazac: <Link href="/help/contact">Kontaktirajte nas</Link></li>
              </ul>
              <p>
                Nastojimo odgovoriti na povratne informacije unutar 5 radnih dana.
              </p>

              <h2>Tehnička specifikacija</h2>
              <p>
                Pristupačnost EduPlatforma oslanja se na sljedeće tehnologije:
              </p>
              <ul>
                <li>HTML</li>
                <li>WAI-ARIA</li>
                <li>CSS</li>
                <li>JavaScript</li>
              </ul>
              <p>
                Ove tehnologije koriste se u skladu s WCAG 2.1 standardima.
              </p>

              <h2>Procjena pristupačnosti</h2>
              <p>
                EduPlatforma procjenjuje pristupačnost sljedećim metodama:
              </p>
              <ul>
                <li>Samoprocjena</li>
                <li>Automatsko testiranje alatima (axe, WAVE)</li>
                <li>Testiranje s čitačima zaslona (NVDA, VoiceOver)</li>
                <li>Testiranje navigacije tipkovnicom</li>
              </ul>

              <h2>Pravni okvir</h2>
              <p>
                Ova izjava pripremljena je u skladu s Direktivom (EU) 2016/2102
                Europskog parlamenta i Vijeća o pristupačnosti internetskih stranica i
                mobilnih aplikacija tijela javnog sektora.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4">
              Imate prijedlog za poboljšanje pristupačnosti?
            </p>
            <Button asChild>
              <Link href="/help/contact">
                <Mail className="h-4 w-4 mr-2" />
                Pošaljite nam poruku
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

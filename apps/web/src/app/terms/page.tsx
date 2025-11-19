'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsPage() {
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
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Uvjeti korištenja</h1>
              <p className="text-gray-600">Zadnje ažuriranje: 1. siječnja 2024.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="prose prose-gray max-w-none pt-6">
              <h2>1. Prihvaćanje uvjeta</h2>
              <p>
                Korištenjem EduPlatforma web stranice i usluga ("Platforma") pristajete na ove
                Uvjete korištenja. Ako se ne slažete s ovim uvjetima, molimo nemojte koristiti
                našu Platformu.
              </p>

              <h2>2. Opis usluge</h2>
              <p>
                EduPlatforma je online obrazovna platforma koja omogućuje:
              </p>
              <ul>
                <li>Pristup online tečajevima i edukativnom sadržaju</li>
                <li>Interakciju s instruktorima i drugim studentima</li>
                <li>Dobivanje certifikata o završenim tečajevima</li>
                <li>Praćenje napretka u učenju</li>
              </ul>

              <h2>3. Registracija i korisnički račun</h2>
              <p>
                Za korištenje određenih funkcionalnosti Platforme potrebno je kreirati korisnički
                račun. Obvezni ste:
              </p>
              <ul>
                <li>Pružiti točne i potpune informacije pri registraciji</li>
                <li>Ažurirati svoje podatke kad se promijene</li>
                <li>Čuvati sigurnost svoje lozinke</li>
                <li>Odmah nas obavijestiti o neovlaštenom korištenju računa</li>
              </ul>

              <h2>4. Plaćanje i pretplate</h2>
              <p>
                Određeni sadržaji i funkcionalnosti zahtijevaju plaćanje. Prihvaćanjem ovih uvjeta:
              </p>
              <ul>
                <li>Pristajete na cijene navedene u trenutku kupnje</li>
                <li>Ovlašćujete nas za naplatu putem odabrane metode plaćanja</li>
                <li>Razumijete da su pretplate automatski obnavljane dok ih ne otkažete</li>
              </ul>

              <h3>4.1 Politika povrata</h3>
              <p>
                Nudimo 30 dana garancije povrata novca za sve tečajeve. Ako niste zadovoljni,
                možete zatražiti puni povrat unutar 30 dana od kupnje. Za pretplate, povrat
                je moguć samo ako niste pristupili značajnom dijelu sadržaja.
              </p>

              <h2>5. Intelektualno vlasništvo</h2>
              <p>
                Sav sadržaj na Platformi, uključujući ali ne ograničavajući se na tekst, grafike,
                logotipe, video materijale i softver, zaštićen je autorskim pravima i drugim
                pravima intelektualnog vlasništva.
              </p>
              <ul>
                <li>Ne smijete kopirati, distribuirati ili modificirati sadržaj bez dozvole</li>
                <li>Ne smijete dijeliti svoj pristup s drugima</li>
                <li>Ne smijete snimati ili preuzimati video sadržaj bez ovlaštenja</li>
              </ul>

              <h2>6. Pravila ponašanja</h2>
              <p>
                Korisnici se obvezuju:
              </p>
              <ul>
                <li>Poštovati druge korisnike i instruktore</li>
                <li>Ne objavljivati uvredljiv, diskriminirajući ili nezakonit sadržaj</li>
                <li>Ne ometati rad Platforme ili drugih korisnika</li>
                <li>Ne koristiti Platformu za spam ili neovlašteno reklamiranje</li>
              </ul>

              <h2>7. Odricanje od odgovornosti</h2>
              <p>
                Platforma se pruža "kakva jest". Ne garantiramo:
              </p>
              <ul>
                <li>Da će Platforma uvijek biti dostupna bez prekida</li>
                <li>Da će sadržaj biti bez grešaka</li>
                <li>Specifične rezultate od korištenja naših tečajeva</li>
              </ul>

              <h2>8. Ograničenje odgovornosti</h2>
              <p>
                U maksimalnoj mjeri dopuštenoj zakonom, EduPlatforma neće biti odgovorna za
                bilo kakvu neizravnu, slučajnu, posebnu ili posljedičnu štetu nastalu
                korištenjem ili nemogućnošću korištenja Platforme.
              </p>

              <h2>9. Prestanak korištenja</h2>
              <p>
                Zadržavamo pravo da suspendiramo ili ukinemo vaš račun bez prethodne najave
                ako prekršite ove uvjete. Po prestanku, gubite pristup kupljenom sadržaju.
              </p>

              <h2>10. Izmjene uvjeta</h2>
              <p>
                Zadržavamo pravo izmjene ovih uvjeta u bilo kojem trenutku. O značajnim
                promjenama bit ćete obaviješteni putem e-maila ili obavijesti na Platformi.
                Nastavak korištenja Platforme nakon izmjena znači prihvaćanje novih uvjeta.
              </p>

              <h2>11. Mjerodavno pravo</h2>
              <p>
                Ovi uvjeti korištenja regulirani su i tumače se u skladu sa zakonima
                Republike Hrvatske. Za sve sporove nadležni su sudovi u Zagrebu.
              </p>

              <h2>12. Kontakt</h2>
              <p>
                Za pitanja o ovim uvjetima, molimo kontaktirajte nas:
              </p>
              <ul>
                <li>Email: legal@eduplatforma.hr</li>
                <li>Adresa: Ilica 1, 10000 Zagreb, Hrvatska</li>
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Pogledajte i našu{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Politiku privatnosti
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

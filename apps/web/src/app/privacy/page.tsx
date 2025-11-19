'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
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
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold">Politika privatnosti</h1>
              <p className="text-gray-600">Zadnje ažuriranje: 1. siječnja 2024.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="prose prose-gray max-w-none pt-6">
              <h2>1. Uvod</h2>
              <p>
                EduPlatforma d.o.o. ("mi", "nas", "naše") posvećena je zaštiti vaše privatnosti.
                Ova Politika privatnosti objašnjava kako prikupljamo, koristimo, dijelimo i
                štitimo vaše osobne podatke kada koristite našu platformu.
              </p>

              <h2>2. Podaci koje prikupljamo</h2>

              <h3>2.1 Podaci koje nam pružate</h3>
              <ul>
                <li>Identifikacijski podaci (ime, prezime, email adresa)</li>
                <li>Podaci o računu (lozinka, postavke)</li>
                <li>Podaci o plaćanju (podaci kartice obrađuju se preko sigurnog payment providera)</li>
                <li>Podaci o profilu (fotografija, biografija, interesi)</li>
                <li>Komunikacijski podaci (poruke, povratne informacije)</li>
              </ul>

              <h3>2.2 Automatski prikupljeni podaci</h3>
              <ul>
                <li>Podaci o uređaju (tip, operativni sustav, preglednik)</li>
                <li>Podaci o korištenju (pogledane stranice, tečajevi, vrijeme provedeno)</li>
                <li>IP adresa i približna lokacija</li>
                <li>Kolačići i slične tehnologije</li>
              </ul>

              <h2>3. Kako koristimo vaše podatke</h2>
              <p>
                Vaše podatke koristimo za:
              </p>
              <ul>
                <li>Pružanje i poboljšanje naših usluga</li>
                <li>Personalizaciju vašeg iskustva učenja</li>
                <li>Obradu plaćanja i transakcija</li>
                <li>Komunikaciju o vašem računu i uslugama</li>
                <li>Slanje marketinških poruka (uz vaš pristanak)</li>
                <li>Analizu korištenja i poboljšanje platforme</li>
                <li>Sprječavanje prijevara i osiguranje sigurnosti</li>
                <li>Usklađivanje sa zakonskim obvezama</li>
              </ul>

              <h2>4. Pravna osnova za obradu</h2>
              <p>
                Vaše podatke obrađujemo na temelju:
              </p>
              <ul>
                <li><strong>Ugovor</strong> - za pružanje naših usluga</li>
                <li><strong>Privola</strong> - za marketing i kolačiće</li>
                <li><strong>Legitimni interes</strong> - za poboljšanje usluga i sigurnost</li>
                <li><strong>Zakonska obveza</strong> - za računovodstvene i porezne svrhe</li>
              </ul>

              <h2>5. Dijeljenje podataka</h2>
              <p>
                Vaše podatke možemo dijeliti s:
              </p>
              <ul>
                <li><strong>Instruktorima</strong> - osnovne podatke o studentima na njihovim tečajevima</li>
                <li><strong>Pružateljima usluga</strong> - hosting, analitika, plaćanja (samo potrebni podaci)</li>
                <li><strong>Vlastima</strong> - kada to zahtijeva zakon</li>
              </ul>
              <p>
                Ne prodajemo vaše osobne podatke trećim stranama.
              </p>

              <h2>6. Vaša prava</h2>
              <p>
                Prema GDPR-u imate pravo na:
              </p>
              <ul>
                <li><strong>Pristup</strong> - zatražiti kopiju svojih podataka</li>
                <li><strong>Ispravak</strong> - ispraviti netočne podatke</li>
                <li><strong>Brisanje</strong> - zatražiti brisanje svojih podataka</li>
                <li><strong>Ograničenje</strong> - ograničiti obradu svojih podataka</li>
                <li><strong>Prenosivost</strong> - dobiti podatke u strojno čitljivom formatu</li>
                <li><strong>Prigovor</strong> - prigovoriti obradi za marketing</li>
                <li><strong>Povlačenje privole</strong> - povući privolu u bilo kojem trenutku</li>
              </ul>
              <p>
                Za ostvarivanje prava kontaktirajte nas na privacy@eduplatforma.hr.
              </p>

              <h2>7. Kolačići</h2>
              <p>
                Koristimo kolačiće za:
              </p>
              <ul>
                <li><strong>Nužni kolačići</strong> - potrebni za rad platforme</li>
                <li><strong>Funkcionalni kolačići</strong> - pamte vaše postavke</li>
                <li><strong>Analitički kolačići</strong> - razumijevanje korištenja</li>
                <li><strong>Marketinški kolačići</strong> - prikazivanje relevantnih oglasa</li>
              </ul>
              <p>
                Možete upravljati postavkama kolačića u svom pregledniku ili putem naše bannera za kolačiće.
              </p>

              <h2>8. Sigurnost podataka</h2>
              <p>
                Implementirali smo tehničke i organizacijske mjere za zaštitu vaših podataka:
              </p>
              <ul>
                <li>SSL/TLS enkripcija za sve podatke u prijenosu</li>
                <li>Enkripcija osjetljivih podataka u bazi</li>
                <li>Redovite sigurnosne provjere</li>
                <li>Ograničeni pristup podacima samo ovlaštenom osoblju</li>
                <li>Redovite sigurnosne kopije</li>
              </ul>

              <h2>9. Zadržavanje podataka</h2>
              <p>
                Vaše podatke zadržavamo:
              </p>
              <ul>
                <li>Podatke o računu - dok god imate aktivan račun</li>
                <li>Podatke o plaćanju - 10 godina (zakonska obveza)</li>
                <li>Podatke o korištenju - 2 godine</li>
                <li>Marketinške privole - dok ih ne povučete</li>
              </ul>

              <h2>10. Međunarodni prijenosi</h2>
              <p>
                Vaši podaci mogu se prenositi i obrađivati u zemljama izvan EEA. U tim slučajevima
                osiguravamo odgovarajuće zaštitne mjere prema GDPR-u (standardne ugovorne klauzule).
              </p>

              <h2>11. Djeca</h2>
              <p>
                Naša platforma nije namijenjena djeci mlađoj od 16 godina. Ako postanemo svjesni
                da smo prikupili podatke djeteta bez roditeljskog pristanka, izbrisat ćemo ih.
              </p>

              <h2>12. Izmjene politike</h2>
              <p>
                Možemo povremeno ažurirati ovu politiku. O značajnim promjenama obavijestit
                ćemo vas putem e-maila ili obavijesti na platformi.
              </p>

              <h2>13. Kontakt i pritužbe</h2>
              <p>
                Za pitanja o privatnosti ili ostvarivanje prava:
              </p>
              <ul>
                <li>Email: privacy@eduplatforma.hr</li>
                <li>Službenik za zaštitu podataka: dpo@eduplatforma.hr</li>
                <li>Adresa: Ilica 1, 10000 Zagreb, Hrvatska</li>
              </ul>
              <p>
                Imate pravo podnijeti pritužbu Agenciji za zaštitu osobnih podataka (AZOP):
                www.azop.hr
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Pogledajte i naše{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Uvjete korištenja
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

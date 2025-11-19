'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Cookie, Settings, X, Shield } from 'lucide-react'

interface CookiePreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = 'cookie-consent'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setShowBanner(true)
    } else {
      try {
        const saved = JSON.parse(consent)
        setPreferences(saved.preferences)
      } catch {
        setShowBanner(true)
      }
    }
  }, [])

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        preferences: prefs,
        timestamp: new Date().toISOString(),
      })
    )
    setShowBanner(false)
    setShowSettings(false)

    // Here you would typically initialize analytics/marketing scripts
    // based on the preferences
    if (prefs.analytics) {
      // Initialize analytics
    }
    if (prefs.marketing) {
      // Initialize marketing cookies
    }
  }

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    saveConsent(allAccepted)
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    setPreferences(necessaryOnly)
    saveConsent(necessaryOnly)
  }

  const savePreferences = () => {
    saveConsent(preferences)
  }

  if (!showBanner && !showSettings) {
    return null
  }

  return (
    <>
      {/* Banner */}
      {showBanner && !showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Koristimo kolačiće</h3>
                  <p className="text-sm text-gray-600">
                    Koristimo kolačiće za poboljšanje vašeg iskustva, analizu prometa i
                    personalizaciju sadržaja. Možete prilagoditi postavke ili prihvatiti
                    sve kolačiće.{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Saznaj više
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Postavke
                </Button>
                <Button variant="outline" size="sm" onClick={acceptNecessary}>
                  Samo nužni
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  Prihvati sve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Postavke kolačića
            </DialogTitle>
            <DialogDescription>
              Prilagodite koje kolačiće želite dopustiti. Nužni kolačići su uvijek aktivni.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-medium">Nužni kolačići</h4>
                <p className="text-sm text-gray-500">
                  Potrebni za osnovno funkcioniranje stranice. Ne mogu se isključiti.
                </p>
              </div>
              <Switch checked disabled />
            </div>

            {/* Functional */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-medium">Funkcionalni kolačići</h4>
                <p className="text-sm text-gray-500">
                  Pamte vaše postavke i preferencije za bolje iskustvo.
                </p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, functional: checked })
                }
              />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-medium">Analitički kolačići</h4>
                <p className="text-sm text-gray-500">
                  Pomažu nam razumjeti kako koristite stranicu i poboljšati uslugu.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked })
                }
              />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-medium">Marketinški kolačići</h4>
                <p className="text-sm text-gray-500">
                  Koriste se za prikazivanje relevantnih oglasa na drugim stranicama.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, marketing: checked })
                }
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={acceptNecessary} className="w-full sm:w-auto">
              Samo nužni
            </Button>
            <Button onClick={savePreferences} className="w-full sm:w-auto">
              Spremi postavke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CookieConsent

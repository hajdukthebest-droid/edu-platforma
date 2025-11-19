'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import api from '@/lib/api'
import { Mail, CheckCircle, Loader2, Sparkles } from 'lucide-react'

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'footer'
  className?: string
}

export function NewsletterSignup({ variant = 'default', className }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [success, setSuccess] = useState(false)

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/newsletter/subscribe', { email })
      return response.data
    },
    onSuccess: () => {
      setSuccess(true)
      setEmail('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && (variant === 'footer' || agreed)) {
      subscribeMutation.mutate(email)
    }
  }

  if (success) {
    return (
      <div className={`text-center ${variant === 'footer' ? 'text-white' : ''} ${className}`}>
        <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${variant === 'footer' ? 'text-green-400' : 'text-green-500'}`} />
        <p className="font-medium">Hvala na pretplati!</p>
        <p className={`text-sm ${variant === 'footer' ? 'text-gray-400' : 'text-gray-500'}`}>
          Provjerite inbox za potvrdu.
        </p>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Vaš email"
          required
          className="flex-1"
        />
        <Button type="submit" disabled={subscribeMutation.isPending}>
          {subscribeMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Pretplati se'
          )}
        </Button>
      </form>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <h4 className="font-semibold mb-3">Newsletter</h4>
        <p className="text-sm text-gray-400 mb-3">
          Primajte novosti i savjete direktno u inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vas@email.com"
            required
            className="flex-1 bg-gray-800 border-gray-700"
          />
          <Button type="submit" size="sm" disabled={subscribeMutation.isPending}>
            {subscribeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Pretplatite se na newsletter</h3>
          <p className="text-sm text-gray-600">
            Budite u toku s najnovijim tečajevima, savjetima i ekskluzivnim ponudama.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Unesite email adresu"
            required
          />

          <div className="flex items-start gap-2">
            <Checkbox
              id="newsletter-agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label htmlFor="newsletter-agree" className="text-xs text-gray-500">
              Slažem se s primanjem promotivnih emailova. Možete se odjaviti u bilo kojem trenutku.
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!agreed || subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Slanje...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Pretplati se
              </>
            )}
          </Button>
        </form>

        {subscribeMutation.isError && (
          <p className="text-sm text-red-500 text-center mt-2">
            Došlo je do greške. Pokušajte ponovo.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default NewsletterSignup

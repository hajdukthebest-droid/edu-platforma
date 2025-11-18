'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Download, Share2, Award, Linkedin, Twitter, Facebook, Mail, MessageCircle, Link, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function CertificateViewPage({ params }: { params: { id: string } }) {
  const [copied, setCopied] = useState(false)

  const { data: certificate, isLoading } = useQuery({
    queryKey: ['certificate', params.id],
    queryFn: async () => {
      const response = await api.get(`/certificates/${params.id}`)
      return response.data.data
    },
  })

  const { data: shareUrls } = useQuery({
    queryKey: ['certificate-share-urls', params.id],
    queryFn: async () => {
      const response = await api.get(`/certificates/${params.id}/share-urls`)
      return response.data.data
    },
    enabled: !!certificate,
  })

  const trackShareMutation = useMutation({
    mutationFn: async (platform: string) => {
      await api.post(`/certificates/${params.id}/track-share`, { platform })
    },
  })

  const handleShare = (platform: string, url: string) => {
    trackShareMutation.mutate(platform)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCopyLink = async () => {
    if (shareUrls?.publicUrl) {
      await navigator.clipboard.writeText(shareUrls.publicUrl)
      setCopied(true)
      trackShareMutation.mutate('copy')
      toast.success('Link kopiran u međuspremnik')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Certifikat nije pronađen</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Actions */}
        <div className="flex justify-end gap-2 mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Podijeli
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {shareUrls?.linkedin && (
                <DropdownMenuItem onClick={() => handleShare('linkedin', shareUrls.linkedin)}>
                  <Linkedin className="h-4 w-4 mr-2 text-[#0077b5]" />
                  LinkedIn
                </DropdownMenuItem>
              )}
              {shareUrls?.linkedInAddToProfile && (
                <DropdownMenuItem onClick={() => handleShare('linkedin_profile', shareUrls.linkedInAddToProfile)}>
                  <Linkedin className="h-4 w-4 mr-2 text-[#0077b5]" />
                  Dodaj na LinkedIn profil
                </DropdownMenuItem>
              )}
              {shareUrls?.twitter && (
                <DropdownMenuItem onClick={() => handleShare('twitter', shareUrls.twitter)}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </DropdownMenuItem>
              )}
              {shareUrls?.facebook && (
                <DropdownMenuItem onClick={() => handleShare('facebook', shareUrls.facebook)}>
                  <Facebook className="h-4 w-4 mr-2 text-[#1877f2]" />
                  Facebook
                </DropdownMenuItem>
              )}
              {shareUrls?.whatsapp && (
                <DropdownMenuItem onClick={() => handleShare('whatsapp', shareUrls.whatsapp)}>
                  <MessageCircle className="h-4 w-4 mr-2 text-[#25d366]" />
                  WhatsApp
                </DropdownMenuItem>
              )}
              {shareUrls?.email && (
                <DropdownMenuItem onClick={() => handleShare('email', shareUrls.email)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <Link className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Kopirano!' : 'Kopiraj link'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <a href={`/api/certificates/${certificate.id}/pdf`} download>
              <Download className="h-4 w-4 mr-2" />
              Preuzmi PDF
            </a>
          </Button>
        </div>

        {/* Certificate */}
        <Card className="p-12 bg-white shadow-2xl">
          <div className="text-center space-y-6">
            {/* Ornamental Header */}
            <div className="flex justify-center">
              <Award className="h-20 w-20 text-yellow-500" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
                Certifikat o završetku
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto"></div>
            </div>

            {/* Recipient */}
            <div className="py-6">
              <p className="text-lg text-gray-600 mb-2">Ovim se potvrđuje da je</p>
              <h2 className="text-5xl font-serif font-bold text-gray-900 my-4">
                {certificate.user.firstName} {certificate.user.lastName}
              </h2>
              <p className="text-lg text-gray-600">uspješno završio/la tečaj</p>
            </div>

            {/* Course */}
            <div className="py-4 border-y-2 border-gray-200">
              <h3 className="text-3xl font-serif font-semibold text-blue-600">
                {certificate.course.title}
              </h3>
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-6 py-6 text-left max-w-2xl mx-auto">
              <div>
                <p className="text-sm text-gray-500">Broj certifikata</p>
                <p className="font-mono text-sm font-semibold">{certificate.certificateNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Datum izdavanja</p>
                <p className="font-semibold">{formatDate(certificate.issueDate)}</p>
              </div>
              {certificate.course.cpdPoints && (
                <div>
                  <p className="text-sm text-gray-500">CPD bodovi</p>
                  <p className="font-semibold">{certificate.course.cpdPoints}</p>
                </div>
              )}
              {certificate.expiryDate && (
                <div>
                  <p className="text-sm text-gray-500">Vrijedi do</p>
                  <p className="font-semibold">{formatDate(certificate.expiryDate)}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Verifikacijski kod: {certificate.certificateNumber}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Ovaj certifikat može se verificirati na {certificate.verificationUrl}
              </p>
            </div>

            {/* Signature */}
            <div className="pt-8">
              <div className="inline-block">
                <div className="border-t-2 border-gray-800 pt-2 px-8">
                  <p className="font-serif font-semibold">Edu Platforma</p>
                  <p className="text-sm text-gray-600">PharmaVision Solutions D.O.O.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Verification Link */}
        <div className="mt-6 text-center">
          <a
            href={certificate.verificationUrl}
            className="text-blue-600 hover:underline text-sm"
          >
            Verificiraj certifikat →
          </a>
        </div>
      </div>
    </div>
  )
}

import { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, CheckCircle, Share2, Linkedin, Twitter, Facebook, Mail, Link } from 'lucide-react'

async function getCertificate(certificateNumber: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const res = await fetch(`${apiUrl}/certificates/public/${certificateNumber}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  const data = await res.json()
  return data.data
}

export async function generateMetadata({
  params,
}: {
  params: { certificateNumber: string }
}): Promise<Metadata> {
  const certificate = await getCertificate(params.certificateNumber)

  if (!certificate) {
    return {
      title: 'Certifikat nije pronađen',
    }
  }

  const title = `Certifikat - ${certificate.user.firstName} ${certificate.user.lastName}`
  const description = `${certificate.user.firstName} ${certificate.user.lastName} je uspješno završio/la tečaj "${certificate.course.title}" na Edu Platformi.`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/certificates/public/${certificate.certificateNumber}`,
      images: certificate.ogImageUrl ? [certificate.ogImageUrl] : [],
      siteName: 'Edu Platforma',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: certificate.ogImageUrl ? [certificate.ogImageUrl] : [],
    },
  }
}

export default async function PublicCertificatePage({
  params,
}: {
  params: { certificateNumber: string }
}) {
  const certificate = await getCertificate(params.certificateNumber)

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Certifikat nije pronađen</h1>
          <p className="text-gray-600">
            Provjerite je li verifikacijski broj ispravan.
          </p>
        </Card>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const certificateUrl = `${baseUrl}/certificates/public/${certificate.certificateNumber}`
  const shareText = `Upravo sam završio/la tečaj "${certificate.course.title}" na Edu Platformi! 🎓`

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(certificateUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(`Certifikat: ${certificate.course.title}`)}&body=${encodeURIComponent(`${shareText}\n\n${certificateUrl}`)}`,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Verification Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Verificirani certifikat</span>
          </div>
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

        {/* Share Section */}
        <Card className="mt-6 p-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
              <Share2 className="h-5 w-5" />
              Podijeli certifikat
            </h4>
            <div className="flex justify-center gap-3 flex-wrap">
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg hover:bg-[#006396] transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </a>
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877f2] text-white rounded-lg hover:bg-[#166fe5] transition-colors"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
              <a
                href={shareLinks.email}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {certificate.viewCount > 0 && `${certificate.viewCount} pregleda`}
              {certificate.viewCount > 0 && certificate.shareCount > 0 && ' • '}
              {certificate.shareCount > 0 && `${certificate.shareCount} dijeljenja`}
            </p>
          </div>
        </Card>

        {/* Back to platform */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Povratak na Edu Platformu
          </a>
        </div>
      </div>
    </div>
  )
}

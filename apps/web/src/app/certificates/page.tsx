'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import api from '@/lib/api'
import {
  Award,
  Download,
  Loader2,
  ExternalLink,
  Calendar,
  BookOpen,
  CheckCircle,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Certificate {
  id: string
  certificateNumber: string
  title: string
  description: string
  issueDate: string
  expiryDate: string | null
  pdfUrl: string | null
  verificationUrl: string | null
  course: {
    id: string
    title: string
    slug: string
    thumbnail: string | null
    cpdPoints: number | null
    cmeCredits: number | null
  }
}

export default function CertificatesPage() {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Fetch user certificates
  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ['user-certificates'],
    queryFn: async () => {
      const response = await api.get('/certificates')
      return response.data.data
    },
  })

  const handleViewDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setShowDetailsModal(true)
  }

  const handleDownloadPDF = async (certificateId: string, certificateNumber: string) => {
    try {
      setDownloadingId(certificateId)
      const response = await api.get(`/certificates/${certificateId}/pdf`, {
        responseType: 'blob',
      })

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `certificate-${certificateNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download certificate:', error)
      alert('Greška pri preuzimanju certifikata')
    } finally {
      setDownloadingId(null)
    }
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Award className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Moji Certifikati</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Pogledajte i preuzmite sve certifikate za završene tečajeve
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : !certificates || certificates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">Nemate još certifikata</h3>
              <p className="text-gray-600 mb-6">
                Završite tečaj da biste dobili svoj prvi certifikat!
              </p>
              <Link href="/courses">
                <Button>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Pregledaj tečajeve
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ukupno certifikata</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {certificates.length}
                      </p>
                    </div>
                    <Award className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Aktivnih certifikata</p>
                      <p className="text-3xl font-bold text-green-600">
                        {certificates.filter((c) => !isExpired(c.expiryDate)).length}
                      </p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">CPD Bodovi</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {certificates.reduce(
                          (sum, c) => sum + (c.course.cpdPoints || 0),
                          0
                        )}
                      </p>
                    </div>
                    <FileText className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {certificates.map((certificate) => (
                <Card
                  key={certificate.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {certificate.course.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          Izdano:{' '}
                          {new Date(certificate.issueDate).toLocaleDateString('hr-HR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <Award className="h-10 w-10 text-purple-600" />
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Certificate Number */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Broj certifikata
                        </p>
                        <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded">
                          {certificate.certificateNumber}
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        {isExpired(certificate.expiryDate) ? (
                          <Badge className="bg-red-100 text-red-700">Istekao</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">Aktivan</Badge>
                        )}

                        {certificate.course.cpdPoints && certificate.course.cpdPoints > 0 && (
                          <Badge className="bg-blue-100 text-blue-700">
                            {certificate.course.cpdPoints} CPD bodova
                          </Badge>
                        )}

                        {certificate.course.cmeCredits && certificate.course.cmeCredits > 0 && (
                          <Badge className="bg-purple-100 text-purple-700">
                            {certificate.course.cmeCredits} CME kredita
                          </Badge>
                        )}
                      </div>

                      {/* Expiry Date */}
                      {certificate.expiryDate && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Vrijedi do: </span>
                          {new Date(certificate.expiryDate).toLocaleDateString('hr-HR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleDownloadPDF(certificate.id, certificate.certificateNumber)
                          }
                          disabled={downloadingId === certificate.id}
                          className="flex-1"
                        >
                          {downloadingId === certificate.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Preuzimanje...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Preuzmi PDF
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(certificate)}
                        >
                          Detalji
                        </Button>

                        {certificate.verificationUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={certificate.verificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Certificate Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Detalji Certifikata
            </DialogTitle>
            <DialogDescription>
              Potpune informacije o vašem certifikatu
            </DialogDescription>
          </DialogHeader>

          {selectedCertificate && (
            <div className="space-y-6">
              {/* Course Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {selectedCertificate.course.title}
                </h3>
                <p className="text-gray-600">{selectedCertificate.description}</p>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Broj certifikata
                  </p>
                  <p className="font-mono text-sm">{selectedCertificate.certificateNumber}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Datum izdavanja
                  </p>
                  <p className="text-sm">
                    {formatDate(selectedCertificate.issueDate)}
                  </p>
                </div>

                {selectedCertificate.expiryDate && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Vrijedi do
                    </p>
                    <p className="text-sm">
                      {formatDate(selectedCertificate.expiryDate)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Status
                  </p>
                  {isExpired(selectedCertificate.expiryDate) ? (
                    <Badge className="bg-red-100 text-red-700">Istekao</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700">Aktivan</Badge>
                  )}
                </div>
              </div>

              {/* Professional Credits */}
              {(selectedCertificate.course.cpdPoints || selectedCertificate.course.cmeCredits) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Profesionalni krediti</h4>
                  <div className="flex gap-4">
                    {selectedCertificate.course.cpdPoints &&
                      selectedCertificate.course.cpdPoints > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700">
                            {selectedCertificate.course.cpdPoints} CPD bodova
                          </Badge>
                        </div>
                      )}
                    {selectedCertificate.course.cmeCredits &&
                      selectedCertificate.course.cmeCredits > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700">
                            {selectedCertificate.course.cmeCredits} CME kredita
                          </Badge>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    handleDownloadPDF(
                      selectedCertificate.id,
                      selectedCertificate.certificateNumber
                    )
                  }
                  disabled={downloadingId === selectedCertificate.id}
                  className="flex-1"
                >
                  {downloadingId === selectedCertificate.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Preuzimanje...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Preuzmi PDF
                    </>
                  )}
                </Button>

                {selectedCertificate.verificationUrl && (
                  <Button variant="outline" asChild>
                    <Link
                      href={selectedCertificate.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Verifikuj
                    </Link>
                  </Button>
                )}

                <Button variant="outline" asChild>
                  <Link href={`/courses/${selectedCertificate.course.slug}`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Vidi tečaj
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

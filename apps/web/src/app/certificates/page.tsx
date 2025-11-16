'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Award, Download, ExternalLink, Calendar, Clock } from 'lucide-react'

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const response = await api.get('/certificates')
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Moji certifikati</h1>
              <p className="text-gray-600 mt-1">Pregled svih vaših postignuća</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!certificates || certificates.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Još nemate certifikate</h3>
              <p className="text-gray-600 mb-6">
                Završite tečaj kako biste zaradili svoj prvi certifikat
              </p>
              <Button asChild>
                <a href="/courses">Pregledaj tečajeve</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert: any) => (
              <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Award className="h-8 w-8 text-yellow-500" />
                    {cert.expiryDate && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          new Date(cert.expiryDate) > new Date()
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {new Date(cert.expiryDate) > new Date() ? 'Aktivan' : 'Istekao'}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3 line-clamp-2">{cert.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-gray-900 mb-1">
                        {cert.course.title}
                      </div>
                      {cert.course.cpdPoints && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          <span>{cert.course.cpdPoints} CPD bodova</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Izdano: {formatDate(cert.issueDate)}</span>
                    </div>

                    {cert.expiryDate && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Vrijedi do: {formatDate(cert.expiryDate)}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t space-y-2">
                      <div className="text-xs text-gray-500">
                        Certifikat br: {cert.certificateNumber}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" asChild>
                          <a href={`/certificates/${cert.id}/view`}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Pogledaj
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/api/certificates/${cert.id}/pdf`} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

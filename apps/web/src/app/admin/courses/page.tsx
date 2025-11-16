'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import api from '@/lib/api'
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  Star,
  StarOff,
  Users,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED'
  isFeatured: boolean
  price: number
  thumbnail?: string
  createdAt: string
  publishedAt?: string
  creator: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  category?: {
    name: string
    domain?: {
      name: string
    }
  }
  _count?: {
    enrollments: number
    lessons: number
    reviews: number
  }
  averageRating?: number
}

interface CourseDetails extends Course {
  description: string
  learningObjectives: string[]
  requirements: string[]
  targetAudience: string
  level: string
  language: string
  duration: number
  enrollments: any[]
  reviews: any[]
  lessons: any[]
}

export default function AdminCoursesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Filters & Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [featuredFilter, setFeaturedFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // UI State
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [courseToAction, setCourseToAction] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch courses
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['admin-courses', page, limit, search, statusFilter, featuredFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      })

      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (featuredFilter !== 'all') params.append('isFeatured', featuredFilter)

      const response = await api.get(`/admin/courses?${params}`)
      return response.data.data
    },
  })

  // Fetch pending courses count
  const { data: pendingCount } = useQuery({
    queryKey: ['admin-pending-courses-count'],
    queryFn: async () => {
      const response = await api.get('/admin/courses/pending')
      return response.data.data.length
    },
  })

  // Fetch course details
  const { data: courseDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['admin-course-details', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return null
      const response = await api.get(`/courses/${selectedCourse}`)
      return response.data.data as CourseDetails
    },
    enabled: !!selectedCourse && showDetailsModal,
  })

  // Fetch course stats
  const { data: courseStats } = useQuery({
    queryKey: ['admin-course-stats', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return null
      const response = await api.get(`/admin/courses/${selectedCourse}/stats`)
      return response.data.data
    },
    enabled: !!selectedCourse && showDetailsModal,
  })

  // Approve course mutation
  const approveMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await api.post(`/admin/courses/${courseId}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses-count'] })
      setShowApproveModal(false)
      setCourseToAction(null)
      toast({
        title: 'Uspješno',
        description: 'Tečaj je odobren i objavljen',
      })
    },
    onError: () => {
      toast({
        title: 'Greška',
        description: 'Neuspjelo odobravanje tečaja',
        variant: 'destructive',
      })
    },
  })

  // Reject course mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ courseId, reason }: { courseId: string; reason: string }) => {
      const response = await api.post(`/admin/courses/${courseId}/reject`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses-count'] })
      setShowRejectModal(false)
      setCourseToAction(null)
      setRejectionReason('')
      toast({
        title: 'Uspješno',
        description: 'Tečaj je odbijen',
      })
    },
    onError: () => {
      toast({
        title: 'Greška',
        description: 'Neuspjelo odbijanje tečaja',
        variant: 'destructive',
      })
    },
  })

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ courseId, isFeatured }: { courseId: string; isFeatured: boolean }) => {
      const response = await api.put(`/admin/courses/${courseId}/featured`, { isFeatured })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      toast({
        title: 'Uspješno',
        description: variables.isFeatured
          ? 'Tečaj je označen kao istaknuti'
          : 'Tečaj je uklonjen iz istaknutih',
      })
    },
    onError: () => {
      toast({
        title: 'Greška',
        description: 'Neuspjela promjena statusa',
        variant: 'destructive',
      })
    },
  })

  // Archive course mutation
  const archiveMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await api.put(`/admin/courses/${courseId}/archive`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      toast({
        title: 'Uspješno',
        description: 'Tečaj je arhiviran',
      })
    },
    onError: () => {
      toast({
        title: 'Greška',
        description: 'Neuspjelo arhiviranje tečaja',
        variant: 'destructive',
      })
    },
  })

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await api.delete(`/admin/courses/${courseId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      setShowDeleteModal(false)
      setCourseToAction(null)
      toast({
        title: 'Uspješno',
        description: 'Tečaj je obrisan',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Neuspjelo brisanje tečaja',
        variant: 'destructive',
      })
    },
  })

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: { status?: string; isFeatured?: boolean }) => {
      const response = await api.post('/admin/courses/bulk-update', {
        courseIds: selectedCourses,
        ...updates,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      setSelectedCourses([])
      toast({
        title: 'Uspješno',
        description: 'Tečajevi su ažurirani',
      })
    },
    onError: () => {
      toast({
        title: 'Greška',
        description: 'Neuspjelo ažuriranje tečajeva',
        variant: 'destructive',
      })
    },
  })

  const courses = coursesData?.courses || []
  const pagination = coursesData?.pagination || { page: 1, totalPages: 1, total: 0 }

  const handleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(courses.map((c: Course) => c.id))
    }
  }

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    )
  }

  const handleViewDetails = (courseId: string) => {
    setSelectedCourse(courseId)
    setShowDetailsModal(true)
  }

  const handleApproveClick = (courseId: string) => {
    setCourseToAction(courseId)
    setShowApproveModal(true)
  }

  const handleRejectClick = (courseId: string) => {
    setCourseToAction(courseId)
    setShowRejectModal(true)
  }

  const handleDeleteClick = (courseId: string) => {
    setCourseToAction(courseId)
    setShowDeleteModal(true)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
      PUBLISHED: 'bg-green-100 text-green-700',
      ARCHIVED: 'bg-red-100 text-red-700',
    }
    const labels = {
      DRAFT: 'Draft',
      PENDING_REVIEW: 'Na čekanju',
      PUBLISHED: 'Objavljen',
      ARCHIVED: 'Arhiviran',
    }
    return {
      className: colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700',
      label: labels[status as keyof typeof labels] || status,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Moderacija Tečajeva</h1>
          <p className="text-green-100">
            Pregledajte, odobravajte i upravljajte svim tečajevima platforme
          </p>
          {pendingCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg font-semibold">
              <Clock className="h-5 w-5" />
              {pendingCount} tečaj(eva) čeka odobrenje
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Tečajevi ({pagination.total})
              </span>
              {selectedCourses.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-gray-600">
                    Odabrano: {selectedCourses.length}
                  </span>
                  <Select
                    onValueChange={(value) => {
                      if (value === 'archive') {
                        selectedCourses.forEach((id) => archiveMutation.mutate(id))
                      } else if (value === 'feature') {
                        bulkUpdateMutation.mutate({ isFeatured: true })
                      } else if (value === 'unfeature') {
                        bulkUpdateMutation.mutate({ isFeatured: false })
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Grupne akcije" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Označi kao istaknute</SelectItem>
                      <SelectItem value="unfeature">Ukloni istaknute</SelectItem>
                      <SelectItem value="archive">Arhiviraj sve</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pretraži tečajeve..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtriraj po statusu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Na čekanju</SelectItem>
                  <SelectItem value="PUBLISHED">Objavljeni</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Arhivirani</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={featuredFilter}
                onValueChange={(value) => {
                  setFeaturedFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Istaknuti tečajevi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tečajevi</SelectItem>
                  <SelectItem value="true">Samo istaknuti</SelectItem>
                  <SelectItem value="false">Neistaknuti</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split('-')
                  setSortBy(newSortBy)
                  setSortOrder(newSortOrder as 'asc' | 'desc')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sortiraj" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Najnoviji prvo</SelectItem>
                  <SelectItem value="createdAt-asc">Najstariji prvo</SelectItem>
                  <SelectItem value="title-asc">Naslov A-Z</SelectItem>
                  <SelectItem value="title-desc">Naslov Z-A</SelectItem>
                  <SelectItem value="price-desc">Cijena (silazno)</SelectItem>
                  <SelectItem value="price-asc">Cijena (uzlazno)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nema pronađenih tečajeva</p>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedCourses.length === courses.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Tečaj</TableHead>
                        <TableHead>Instruktor</TableHead>
                        <TableHead>Kategorija</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cijena</TableHead>
                        <TableHead>Upisi</TableHead>
                        <TableHead>Ocjena</TableHead>
                        <TableHead>Lekcije</TableHead>
                        <TableHead>Kreiran</TableHead>
                        <TableHead className="text-right">Akcije</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course: Course) => {
                        const statusBadge = getStatusBadge(course.status)
                        return (
                          <TableRow key={course.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedCourses.includes(course.id)}
                                onCheckedChange={() => handleSelectCourse(course.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <Link
                                  href={`/courses/${course.slug}`}
                                  className="font-medium hover:text-green-600"
                                >
                                  {course.title}
                                </Link>
                                {course.isFeatured && (
                                  <span className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 fill-orange-600" /> Istaknuti
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div>
                                <p className="font-medium">
                                  {course.creator.firstName} {course.creator.lastName}
                                </p>
                                <p className="text-gray-500 text-xs">{course.creator.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {course.category ? (
                                <div>
                                  <p className="font-medium">{course.category.name}</p>
                                  {course.category.domain && (
                                    <p className="text-gray-500 text-xs">
                                      {course.category.domain.name}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusBadge.className}>
                                {statusBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {course.price > 0 ? `€${course.price}` : 'Besplatno'}
                            </TableCell>
                            <TableCell className="text-center">
                              {course._count?.enrollments || 0}
                            </TableCell>
                            <TableCell>
                              {course.averageRating ? (
                                <span className="flex items-center gap-1">
                                  ⭐ {Number(course.averageRating).toFixed(1)}
                                  <span className="text-xs text-gray-500">
                                    ({course._count?.reviews || 0})
                                  </span>
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {course._count?.lessons || 0}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(course.createdAt).toLocaleDateString('hr-HR')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(course.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {course.status === 'PENDING_REVIEW' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleApproveClick(course.id)}
                                      disabled={approveMutation.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRejectClick(course.id)}
                                      disabled={rejectMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleFeaturedMutation.mutate({
                                      courseId: course.id,
                                      isFeatured: !course.isFeatured,
                                    })
                                  }
                                  disabled={toggleFeaturedMutation.isPending}
                                >
                                  {course.isFeatured ? (
                                    <StarOff className="h-4 w-4 text-orange-600" />
                                  ) : (
                                    <Star className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>

                                {course.status !== 'ARCHIVED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => archiveMutation.mutate(course.id)}
                                    disabled={archiveMutation.isPending}
                                  >
                                    <Archive className="h-4 w-4 text-gray-600" />
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(course.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Stranica {pagination.page} od {pagination.totalPages} (Ukupno:{' '}
                    {pagination.total})
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prethodna
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                    >
                      Sljedeća
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Detalji Tečaja
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : courseDetails ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-2xl font-bold mb-2">{courseDetails.title}</h2>
                <p className="text-gray-600">{courseDetails.description}</p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="mt-1">
                    <Badge className={getStatusBadge(courseDetails.status).className}>
                      {getStatusBadge(courseDetails.status).label}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cijena</label>
                  <p className="text-lg font-semibold mt-1">
                    {courseDetails.price > 0 ? `€${courseDetails.price}` : 'Besplatno'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nivo</label>
                  <p className="mt-1">{courseDetails.level || 'Nije navedeno'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jezik</label>
                  <p className="mt-1">{courseDetails.language || 'Nije navedeno'}</p>
                </div>
              </div>

              {/* Statistics */}
              {courseStats && (
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{courseStats.totalEnrollments}</p>
                      <p className="text-sm text-gray-600">Upisa</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{courseStats.completionRate}%</p>
                      <p className="text-sm text-gray-600">Stopa završetka</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">
                        {courseDetails.averageRating?.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Prosječna ocjena</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{courseDetails.lessons.length}</p>
                      <p className="text-sm text-gray-600">Lekcija</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Learning Objectives */}
              {courseDetails.learningObjectives && courseDetails.learningObjectives.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Ciljevi učenja</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {courseDetails.learningObjectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {courseDetails.requirements && courseDetails.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Preduvjeti</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {courseDetails.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target Audience */}
              {courseDetails.targetAudience && (
                <div>
                  <h3 className="font-semibold mb-2">Ciljna publika</h3>
                  <p className="text-gray-700">{courseDetails.targetAudience}</p>
                </div>
              )}

              {/* Instructor */}
              <div>
                <h3 className="font-semibold mb-2">Instruktor</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      {courseDetails.creator.firstName} {courseDetails.creator.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{courseDetails.creator.email}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrda odobrenja</DialogTitle>
            <DialogDescription>
              Jeste li sigurni da želite odobriti ovaj tečaj? Tečaj će biti objavljen i vidljiv
              svim korisnicima.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Otkaži
            </Button>
            <Button
              onClick={() => courseToAction && approveMutation.mutate(courseToAction)}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Odobravanje...
                </>
              ) : (
                'Odobri'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odbij tečaj</DialogTitle>
            <DialogDescription>
              Molimo unesite razlog odbijanja tečaja. Instruktor će biti obaviješten.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Unesite razlog odbijanja..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                courseToAction &&
                rejectMutation.mutate({ courseId: courseToAction, reason: rejectionReason })
              }
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Odbijanje...
                </>
              ) : (
                'Odbij'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrda brisanja</DialogTitle>
            <DialogDescription>
              Jeste li sigurni da želite obrisati ovaj tečaj? Ova akcija se ne može poništiti.
              Tečaj se ne može obrisati ako ima aktivne upise.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={() => courseToAction && deleteMutation.mutate(courseToAction)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Brisanje...
                </>
              ) : (
                'Obriši'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

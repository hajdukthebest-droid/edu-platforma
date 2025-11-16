'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  UserCog,
  Ban,
  CheckCircle,
  Trash2,
  Eye,
  Shield,
  Users,
  Mail,
  Calendar,
  Award,
  BookOpen,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  _count?: {
    enrollments: number
    createdCourses: number
    certificates: number
  }
}

interface UserDetails extends User {
  bio?: string
  phoneNumber?: string
  profilePicture?: string
  preferredDomains: string[]
  enrollments: any[]
  certificates: any[]
  createdCourses: any[]
  payments: any[]
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Filters & Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // UI State
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page, limit, search, roleFilter, statusFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      })

      if (search) params.append('search', search)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('isActive', statusFilter)

      const response = await api.get(`/admin/users?${params}`)
      return response.data.data
    },
  })

  // Fetch user details
  const { data: userDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['admin-user-details', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return null
      const response = await api.get(`/admin/users/${selectedUser}`)
      return response.data.data as UserDetails
    },
    enabled: !!selectedUser && showDetailsModal,
  })

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await api.put(`/admin/users/${userId}/role`, { role })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({
        title: 'Uspješno',
        description: 'Uloga korisnika je ažurirana',
      })
    },
    onError: () => {
      toast({
        title: 'Greška',
        description: 'Neuspjelo ažuriranje uloge',
        variant: 'destructive',
      })
    },
  })

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await api.put(`/admin/users/${userId}/status`, { isActive })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({
        title: 'Uspješno',
        description: variables.isActive
          ? 'Korisnik je aktiviran'
          : 'Korisnik je suspendiran',
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

  // Verify user email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.put(`/admin/users/${userId}/verify`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({
        title: 'Uspješno',
        description: 'Email korisnika je verificiran',
      })
    },
    onError: () => {
      toast({
        title: 'Greška',
        description: 'Neuspjela verifikacija emaila',
        variant: 'destructive',
      })
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/admin/users/${userId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setShowDeleteModal(false)
      setUserToDelete(null)
      toast({
        title: 'Uspješno',
        description: 'Korisnik je obrisan',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Neuspjelo brisanje korisnika',
        variant: 'destructive',
      })
    },
  })

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: { isActive?: boolean; role?: string }) => {
      const response = await api.post('/admin/users/bulk-update', {
        userIds: selectedUsers,
        ...updates,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setSelectedUsers([])
      toast({
        title: 'Uspješno',
        description: 'Korisnici su ažurirani',
      })
    },
    onError: () => {
      toast({
        title: 'Greška',
        description: 'Neuspjelo ažuriranje korisnika',
        variant: 'destructive',
      })
    },
  })

  const users = usersData?.users || []
  const pagination = usersData?.pagination || { page: 1, totalPages: 1, total: 0 }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((u: User) => u.id))
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleViewDetails = (userId: string) => {
    setSelectedUser(userId)
    setShowDetailsModal(true)
  }

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete)
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      STUDENT: 'bg-blue-100 text-blue-700',
      INSTRUCTOR: 'bg-green-100 text-green-700',
      ADMIN: 'bg-purple-100 text-purple-700',
      SUPER_ADMIN: 'bg-red-100 text-red-700',
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Upravljanje Korisnicima</h1>
          <p className="text-purple-100">
            Pregledajte, pretražujte i upravljajte svim korisnicima platforme
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Korisnici ({pagination.total})
              </span>
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-gray-600">
                    Odabrano: {selectedUsers.length}
                  </span>
                  <Select
                    onValueChange={(value) => {
                      if (value === 'activate') {
                        bulkUpdateMutation.mutate({ isActive: true })
                      } else if (value === 'deactivate') {
                        bulkUpdateMutation.mutate({ isActive: false })
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Grupne akcije" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activate">Aktiviraj sve</SelectItem>
                      <SelectItem value="deactivate">Suspendiraj sve</SelectItem>
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
                  placeholder="Pretraži korisnike..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>

              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtriraj po ulozi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve uloge</SelectItem>
                  <SelectItem value="STUDENT">Studenti</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instruktori</SelectItem>
                  <SelectItem value="ADMIN">Administratori</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admini</SelectItem>
                </SelectContent>
              </Select>

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
                  <SelectItem value="true">Aktivni</SelectItem>
                  <SelectItem value="false">Suspendirani</SelectItem>
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
                  <SelectItem value="firstName-asc">Ime A-Z</SelectItem>
                  <SelectItem value="firstName-desc">Ime Z-A</SelectItem>
                  <SelectItem value="email-asc">Email A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nema pronađenih korisnika</p>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length === users.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Korisnik</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Uloga</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Upisi</TableHead>
                        <TableHead>Tečajevi</TableHead>
                        <TableHead>Certifikati</TableHead>
                        <TableHead>Registriran</TableHead>
                        <TableHead className="text-right">Akcije</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => handleSelectUser(user.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {user.firstName} {user.lastName}
                              </span>
                              {!user.emailVerified && (
                                <span className="text-xs text-orange-600 flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> Nije verificiran
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadge(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <Badge className="bg-green-100 text-green-700">
                                Aktivan
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700">
                                Suspendiran
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {user._count?.enrollments || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {user._count?.createdCourses || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {user._count?.certificates || 0}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString('hr-HR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(user.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {!user.emailVerified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => verifyEmailMutation.mutate(user.id)}
                                  disabled={verifyEmailMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleStatusMutation.mutate({
                                    userId: user.id,
                                    isActive: !user.isActive,
                                  })
                                }
                                disabled={toggleStatusMutation.isPending}
                              >
                                {user.isActive ? (
                                  <Ban className="h-4 w-4 text-red-600" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </Button>

                              {user.role !== 'SUPER_ADMIN' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(user.id)}
                                  disabled={deleteUserMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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

      {/* User Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Detalji Korisnika
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ime i Prezime</label>
                  <p className="text-lg font-semibold">
                    {userDetails.firstName} {userDetails.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{userDetails.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telefon</label>
                  <p>{userDetails.phoneNumber || 'Nije navedeno'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Uloga</label>
                  <div className="mt-1">
                    <Select
                      value={userDetails.role}
                      onValueChange={(role) =>
                        updateRoleMutation.mutate({ userId: userDetails.id, role })
                      }
                      disabled={userDetails.role === 'SUPER_ADMIN'}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="INSTRUCTOR">Instruktor</SelectItem>
                        <SelectItem value="ADMIN">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {userDetails.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Biografija</label>
                  <p className="text-gray-700 mt-1">{userDetails.bio}</p>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{userDetails.enrollments.length}</p>
                    <p className="text-sm text-gray-600">Upisa</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{userDetails.certificates.length}</p>
                    <p className="text-sm text-gray-600">Certifikata</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{userDetails.createdCourses.length}</p>
                    <p className="text-sm text-gray-600">Kreiranih tečajeva</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {new Date(userDetails.createdAt).toLocaleDateString('hr-HR')}
                    </p>
                    <p className="text-sm text-gray-600">Registriran</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Enrollments */}
              {userDetails.enrollments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Nedavni upisi</h3>
                  <div className="space-y-2">
                    {userDetails.enrollments.slice(0, 5).map((enrollment: any) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <span className="font-medium">{enrollment.course.title}</span>
                        <Badge
                          className={
                            enrollment.completedAt
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {enrollment.completedAt ? 'Završeno' : 'U tijeku'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrda brisanja</DialogTitle>
            <DialogDescription>
              Jeste li sigurni da želite obrisati ovog korisnika? Ova akcija se ne može
              poništiti.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
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

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Plus,
  MessageSquare,
  Calendar,
  FolderOpen,
  Lock,
  Globe,
  UserPlus,
} from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'

export default function StudyGroupsPage() {
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [inviteToken, setInviteToken] = useState('')
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxMembers: 20,
  })

  const { data: groups, isLoading } = useQuery({
    queryKey: ['study-groups'],
    queryFn: async () => {
      const response = await api.get('/study-groups')
      return response.data.data
    },
  })

  const createGroupMutation = useMutation({
    mutationFn: async (data: typeof newGroup) => {
      const response = await api.post('/study-groups', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
      setCreateDialogOpen(false)
      setNewGroup({ name: '', description: '', isPrivate: false, maxMembers: 20 })
      toast.success('Grupa uspješno kreirana')
    },
    onError: () => {
      toast.error('Greška pri kreiranju grupe')
    },
  })

  const joinWithTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post(`/study-groups/invites/${token}/accept`)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
      setInviteToken('')
      toast.success('Uspješno ste se pridružili grupi')
    },
    onError: () => {
      toast.error('Nevažeća ili istekla pozivnica')
    },
  })

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) {
      toast.error('Unesite naziv grupe')
      return
    }
    createGroupMutation.mutate(newGroup)
  }

  const handleJoinWithToken = () => {
    if (!inviteToken.trim()) {
      toast.error('Unesite kod pozivnice')
      return
    }
    joinWithTokenMutation.mutate(inviteToken)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Grupe za učenje</h1>
            <p className="text-gray-600 mt-2">
              Učite zajedno s drugima u grupama za učenje
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            {/* Join with Token */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Pridruži se
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pridruži se grupi</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Kod pozivnice</Label>
                    <Input
                      placeholder="Unesite kod pozivnice"
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleJoinWithToken}
                    className="w-full"
                    disabled={joinWithTokenMutation.isPending}
                  >
                    {joinWithTokenMutation.isPending ? 'Pridruživanje...' : 'Pridruži se'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Create Group */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova grupa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Kreiraj novu grupu</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Naziv grupe *</Label>
                    <Input
                      placeholder="npr. Farmakologija - 3. godina"
                      value={newGroup.name}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Opis</Label>
                    <Textarea
                      placeholder="Opišite svrhu grupe..."
                      value={newGroup.description}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Privatnost</Label>
                      <Select
                        value={newGroup.isPrivate ? 'private' : 'public'}
                        onValueChange={(v) =>
                          setNewGroup({ ...newGroup, isPrivate: v === 'private' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Javna</SelectItem>
                          <SelectItem value="private">Privatna</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Max članova</Label>
                      <Input
                        type="number"
                        min={2}
                        max={100}
                        value={newGroup.maxMembers}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            maxMembers: parseInt(e.target.value) || 20,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateGroup}
                    className="w-full"
                    disabled={createGroupMutation.isPending}
                  >
                    {createGroupMutation.isPending ? 'Kreiranje...' : 'Kreiraj grupu'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Groups List */}
        {!groups || groups.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nemate nijednu grupu za učenje
                </h3>
                <p className="text-gray-600 mb-6">
                  Kreirajte novu grupu ili se pridružite postojećoj pomoću koda pozivnice
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Kreiraj prvu grupu
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group: any) => (
              <Link key={group.id} href={`/study-groups/${group.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        {group.description && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {group.description}
                          </CardDescription>
                        )}
                      </div>
                      {group.isPrivate ? (
                        <Lock className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{group._count?.members || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{group._count?.messages || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-4 w-4" />
                        <span>{group._count?.resources || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{group._count?.sessions || 0}</span>
                      </div>
                    </div>
                    {group.myRole && (
                      <div className="mt-3">
                        <Badge variant={group.myRole === 'ADMIN' ? 'default' : 'secondary'}>
                          {group.myRole === 'ADMIN'
                            ? 'Admin'
                            : group.myRole === 'MODERATOR'
                            ? 'Moderator'
                            : 'Član'}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

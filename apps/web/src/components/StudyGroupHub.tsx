'use client'

import { useState, useEffect, useRef } from 'react'

interface StudyGroup {
  id: string
  name: string
  description?: string
  avatar?: string
  isPrivate: boolean
  maxMembers: number
  createdAt: string
  role: string
  _count: {
    members: number
    messages: number
    resources: number
    sessions?: number
  }
  createdBy: {
    id: string
    firstName: string
    lastName: string
  }
}

interface GroupMember {
  id: string
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

interface GroupMessage {
  id: string
  content: string
  attachments: string[]
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
  }
  replyTo?: {
    id: string
    content: string
    user: {
      firstName: string
      lastName: string
    }
  }
}

interface GroupResource {
  id: string
  title: string
  description?: string
  type: string
  url?: string
  content?: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
  }
}

interface StudySession {
  id: string
  title: string
  description?: string
  scheduledAt: string
  duration: number
  meetingUrl?: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
  }
}

interface StudyGroupHubProps {
  apiBaseUrl?: string
  token?: string
  currentUserId?: string
}

export default function StudyGroupHub({
  apiBaseUrl = '/api',
  token,
  currentUserId,
}: StudyGroupHubProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [activeTab, setActiveTab] = useState<'chat' | 'resources' | 'sessions' | 'members'>('chat')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Group data
  const [members, setMembers] = useState<GroupMember[]>([])
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [resources, setResources] = useState<GroupResource[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])

  // Forms
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [showAddResource, setShowAddResource] = useState(false)
  const [showScheduleSession, setShowScheduleSession] = useState(false)

  // Form data
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [newGroupPrivate, setNewGroupPrivate] = useState(true)
  const [messageContent, setMessageContent] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  // Resource form
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceDescription, setResourceDescription] = useState('')
  const [resourceType, setResourceType] = useState('link')
  const [resourceUrl, setResourceUrl] = useState('')

  // Session form
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [sessionDuration, setSessionDuration] = useState(60)
  const [sessionMeetingUrl, setSessionMeetingUrl] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupData()
    }
  }, [selectedGroup, activeTab])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  })

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${apiBaseUrl}/study-groups`, { headers: getHeaders() })
      const data = await res.json()
      if (data.success) {
        setGroups(data.data)
      }
    } catch (err) {
      setError('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const fetchGroupData = async () => {
    if (!selectedGroup) return

    try {
      // Fetch group details with members
      const groupRes = await fetch(`${apiBaseUrl}/study-groups/${selectedGroup.id}`, {
        headers: getHeaders(),
      })
      const groupData = await groupRes.json()
      if (groupData.success) {
        setMembers(groupData.data.members)
      }

      // Fetch tab-specific data
      if (activeTab === 'chat') {
        const msgRes = await fetch(`${apiBaseUrl}/study-groups/${selectedGroup.id}/messages`, {
          headers: getHeaders(),
        })
        const msgData = await msgRes.json()
        if (msgData.success) {
          setMessages(msgData.data)
        }
      } else if (activeTab === 'resources') {
        const resRes = await fetch(`${apiBaseUrl}/study-groups/${selectedGroup.id}/resources`, {
          headers: getHeaders(),
        })
        const resData = await resRes.json()
        if (resData.success) {
          setResources(resData.data)
        }
      } else if (activeTab === 'sessions') {
        const sessRes = await fetch(`${apiBaseUrl}/study-groups/${selectedGroup.id}/sessions`, {
          headers: getHeaders(),
        })
        const sessData = await sessRes.json()
        if (sessData.success) {
          setSessions(sessData.data)
        }
      }
    } catch (err) {
      console.error('Error fetching group data:', err)
    }
  }

  const createGroup = async () => {
    if (!newGroupName.trim()) return

    try {
      const res = await fetch(`${apiBaseUrl}/study-groups`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          isPrivate: newGroupPrivate,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setGroups([data.data, ...groups])
        setShowCreateGroup(false)
        setNewGroupName('')
        setNewGroupDescription('')
        setNewGroupPrivate(true)
      }
    } catch (err) {
      setError('Failed to create group')
    }
  }

  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedGroup) return

    try {
      const res = await fetch(`${apiBaseUrl}/study-groups/${selectedGroup.id}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content: messageContent }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages([...messages, data.data])
        setMessageContent('')
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const createInvite = async () => {
    if (!selectedGroup) return

    try {
      const res = await fetch(`${apiBaseUrl}/study-groups/${selectedGroup.id}/invites`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: inviteEmail || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        const link = `${window.location.origin}/study-groups/invite/${data.data.token}`
        setInviteLink(link)
        setInviteEmail('')
      }
    } catch (err) {
      setError('Failed to create invite')
    }
  }

  const addResource = async () => {
    if (!resourceTitle.trim() || !selectedGroup) return

    try {
      const res = await fetch(`${apiBaseUrl}/study-groups/${selectedGroup.id}/resources`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: resourceTitle,
          description: resourceDescription,
          type: resourceType,
          url: resourceUrl || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResources([data.data, ...resources])
        setShowAddResource(false)
        setResourceTitle('')
        setResourceDescription('')
        setResourceType('link')
        setResourceUrl('')
      }
    } catch (err) {
      setError('Failed to add resource')
    }
  }

  const scheduleSession = async () => {
    if (!sessionTitle.trim() || !sessionDate || !sessionTime || !selectedGroup) return

    try {
      const scheduledAt = new Date(`${sessionDate}T${sessionTime}`)
      const res = await fetch(`${apiBaseUrl}/study-groups/${selectedGroup.id}/sessions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: sessionTitle,
          description: sessionDescription,
          scheduledAt: scheduledAt.toISOString(),
          duration: sessionDuration,
          meetingUrl: sessionMeetingUrl || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSessions([...sessions, data.data].sort(
          (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        ))
        setShowScheduleSession(false)
        setSessionTitle('')
        setSessionDescription('')
        setSessionDate('')
        setSessionTime('')
        setSessionDuration(60)
        setSessionMeetingUrl('')
      }
    } catch (err) {
      setError('Failed to schedule session')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('hr-HR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar - Groups list */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Study Groups</h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Create new group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {groups.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No groups yet</p>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="mt-2 text-blue-600 hover:underline"
              >
                Create your first group
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 ${
                  selectedGroup?.id === group.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{group.name}</h3>
                    <p className="text-sm text-gray-500">
                      {group._count.members} members
                      {group.isPrivate && (
                        <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          Private
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {!selectedGroup ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Select a group to start collaborating</p>
            </div>
          </div>
        ) : (
          <>
            {/* Group header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedGroup.name}</h2>
                  {selectedGroup.description && (
                    <p className="text-sm text-gray-600">{selectedGroup.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(selectedGroup.role === 'ADMIN' || selectedGroup.role === 'MODERATOR') && (
                    <button
                      onClick={() => setShowInvite(true)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Invite
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mt-4">
                {(['chat', 'resources', 'sessions', 'members'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-sm rounded-lg capitalize ${
                      activeTab === tab
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.user.id === currentUserId ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.user.id === currentUserId
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.user.id !== currentUserId && (
                              <p className="text-xs font-medium mb-1">
                                {message.user.firstName} {message.user.lastName}
                              </p>
                            )}
                            {message.replyTo && (
                              <div className={`text-xs mb-2 p-2 rounded ${
                                message.user.id === currentUserId
                                  ? 'bg-blue-500'
                                  : 'bg-gray-200'
                              }`}>
                                <span className="font-medium">
                                  {message.replyTo.user.firstName}:
                                </span>{' '}
                                {message.replyTo.content.substring(0, 50)}...
                              </div>
                            )}
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.user.id === currentUserId
                                ? 'text-blue-200'
                                : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!messageContent.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Shared Resources</h3>
                    <button
                      onClick={() => setShowAddResource(true)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Resource
                    </button>
                  </div>

                  {resources.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No resources shared yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{resource.title}</h4>
                              {resource.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {resource.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">
                                  {resource.type}
                                </span>
                                <span>
                                  by {resource.user.firstName} {resource.user.lastName}
                                </span>
                                <span>{formatDate(resource.createdAt)}</span>
                              </div>
                            </div>
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Open
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Study Sessions</h3>
                    <button
                      onClick={() => setShowScheduleSession(true)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Schedule Session
                    </button>
                  </div>

                  {sessions.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No sessions scheduled
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => {
                        const isPast = new Date(session.scheduledAt) < new Date()
                        return (
                          <div
                            key={session.id}
                            className={`p-4 border rounded-lg ${
                              isPast
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-blue-200 bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{session.title}</h4>
                                {session.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {session.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-sm">
                                  <span className="flex items-center gap-1 text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formatDate(session.scheduledAt)}
                                  </span>
                                  <span className="text-gray-600">
                                    {session.duration} min
                                  </span>
                                </div>
                              </div>
                              {session.meetingUrl && !isPast && (
                                <a
                                  href={session.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  Join
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Members ({members.length})
                  </h3>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {member.user.firstName.charAt(0)}
                              {member.user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.user.firstName} {member.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{member.user.email}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            member.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : member.role === 'MODERATOR'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Study Group</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Pharmacology Study Group"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="What is this group about?"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newGroupPrivate}
                  onChange={(e) => setNewGroupPrivate(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Private group (invite only)</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                disabled={!newGroupName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite to Group</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="person@example.com"
                />
              </div>
              <button
                onClick={createInvite}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate Invite Link
              </button>
              {inviteLink && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invite Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(inviteLink)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowInvite(false)
                  setInviteLink('')
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Resource</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Resource title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="link">Link</option>
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={resourceDescription}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddResource(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addResource}
                disabled={!resourceTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showScheduleSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Study Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Chapter 5 Review"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="15"
                  step="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting URL (optional)
                </label>
                <input
                  type="url"
                  value={sessionMeetingUrl}
                  onChange={(e) => setSessionMeetingUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowScheduleSession(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={scheduleSession}
                disabled={!sessionTitle.trim() || !sessionDate || !sessionTime}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-white/80 hover:text-white">
            ×
          </button>
        </div>
      )}
    </div>
  )
}

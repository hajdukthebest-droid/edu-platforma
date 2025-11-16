'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { User } from 'lucide-react'
import { FileUpload } from './FileUpload'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onUploadComplete?: (avatarUrl: string) => void
}

export function AvatarUpload({ currentAvatar, onUploadComplete }: AvatarUploadProps) {
  const queryClient = useQueryClient()

  const handleUploadComplete = (data: any) => {
    // Invalidate profile query to refetch with new avatar
    queryClient.invalidateQueries({ queryKey: ['profile'] })

    // Update localStorage user data
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      user.avatar = data.url
      localStorage.setItem('user', JSON.stringify(user))
    }

    onUploadComplete?.(data.url)
  }

  return (
    <div className="space-y-4">
      {/* Current Avatar Preview */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Current avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-1">Profile Picture</h3>
          <p className="text-sm text-gray-600 mb-2">
            JPG, PNG or GIF, max 5MB
          </p>
        </div>
      </div>

      {/* Upload Component */}
      <FileUpload
        endpoint="/upload/avatar"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        maxSize={5}
        buttonText="Change Avatar"
        buttonVariant="outline"
        onUploadComplete={handleUploadComplete}
        onError={(error) => {
          console.error('Avatar upload error:', error)
        }}
      />
    </div>
  )
}

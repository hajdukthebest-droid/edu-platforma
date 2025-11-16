'use client'

import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Upload, X, FileIcon, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface FileUploadProps {
  endpoint: string
  accept?: string
  maxSize?: number // in MB
  onUploadComplete?: (data: any) => void
  onError?: (error: string) => void
  additionalData?: Record<string, any>
  buttonText?: string
  buttonVariant?: 'default' | 'outline' | 'ghost'
  showPreview?: boolean
}

export function FileUpload({
  endpoint,
  accept = 'image/*',
  maxSize = 5,
  onUploadComplete,
  onError,
  additionalData = {},
  buttonText = 'Upload File',
  buttonVariant = 'default',
  showPreview = true,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      const error = `File size exceeds ${maxSize}MB limit`
      onError?.(error)
      alert(error)
      return
    }

    setFile(selectedFile)

    // Generate preview for images
    if (selectedFile.type.startsWith('image/') && showPreview) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append(
        file.type.startsWith('image/') ?
          (endpoint.includes('avatar') ? 'avatar' : 'thumbnail') :
          'attachment',
        file
      )

      // Add additional data
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onUploadComplete?.(response.data.data)
      setFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Upload failed'
      onError?.(errorMessage)
      alert(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            variant={buttonVariant}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        </label>
      </div>

      {file && (
        <div className="border rounded-lg p-4 space-y-4">
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-auto max-h-64 mx-auto rounded"
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {!preview && (
            <div className="flex items-center gap-3">
              <FileIcon className="h-8 w-8 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

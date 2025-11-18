'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import Player from 'video.js/dist/types/player'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

interface VideoPlayerProps {
  lessonId: string
  videoUrl: string
  videoProvider?: 'youtube' | 'vimeo' | 'self-hosted'
  poster?: string
  onProgress?: (currentTime: number, duration: number) => void
  onComplete?: () => void
  onTimeUpdate?: (currentTime: number) => void
  onPlayingChange?: (isPlaying: boolean) => void
  initialPosition?: number
  autoplay?: boolean
  externalPause?: boolean
  onPauseRequest?: () => void
  onResumeRequest?: () => void
}

export default function VideoPlayer({
  lessonId,
  videoUrl,
  videoProvider = 'self-hosted',
  poster,
  onProgress,
  onComplete,
  onTimeUpdate,
  onPlayingChange,
  initialPosition = 0,
  autoplay = false,
  externalPause,
  onPauseRequest,
  onResumeRequest,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedPositionRef = useRef<number>(0)
  const { toast } = useToast()

  // Handle external pause/resume requests
  useEffect(() => {
    if (playerRef.current && externalPause !== undefined) {
      if (externalPause) {
        playerRef.current.pause()
      } else {
        playerRef.current.play()
      }
    }
  }, [externalPause])

  // Save progress to backend
  const saveProgress = useCallback(
    async (currentTime: number, isCompleted: boolean = false) => {
      try {
        // Only save if position changed significantly (more than 3 seconds)
        if (Math.abs(currentTime - lastSavedPositionRef.current) < 3 && !isCompleted) {
          return
        }

        lastSavedPositionRef.current = currentTime

        await api.put(`/progress/lessons/${lessonId}`, {
          lastPosition: Math.floor(currentTime),
          timeSpent: Math.floor(currentTime),
          isCompleted,
        })

        onProgress?.(currentTime, playerRef.current?.duration() || 0)
      } catch (error) {
        console.error('Failed to save progress:', error)
      }
    },
    [lessonId, onProgress]
  )

  // Initialize Video.js player
  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js')
      videoElement.classList.add('vjs-big-play-centered')
      videoRef.current.appendChild(videoElement)

      // Video.js options
      const options: any = {
        autoplay: autoplay,
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        poster: poster,
        controlBar: {
          children: [
            'playToggle',
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl',
            'remainingTimeDisplay',
            'playbackRateMenuButton',
            'pictureInPictureToggle',
            'fullscreenToggle',
          ],
        },
      }

      // Handle different video sources
      if (videoProvider === 'youtube') {
        options.techOrder = ['youtube']
        options.sources = [
          {
            type: 'video/youtube',
            src: videoUrl,
          },
        ]
      } else if (videoProvider === 'vimeo') {
        options.techOrder = ['vimeo']
        options.sources = [
          {
            type: 'video/vimeo',
            src: videoUrl,
          },
        ]
      } else {
        // Self-hosted video
        options.sources = [
          {
            src: videoUrl,
            type: 'video/mp4',
          },
        ]
      }

      const player = videojs(videoElement, options, () => {
        console.log('Video.js player ready')
        setIsReady(true)

        // Jump to saved position
        if (initialPosition > 0) {
          player.currentTime(initialPosition)
        }
      })

      playerRef.current = player

      // Event listeners
      player.on('play', () => {
        if (!hasStarted) {
          setHasStarted(true)
        }

        onPlayingChange?.(true)

        // Start progress tracking interval
        progressIntervalRef.current = setInterval(() => {
          const currentTime = player.currentTime() || 0
          const duration = player.duration() || 0

          // Auto-save progress every 5 seconds
          if (currentTime > 0) {
            saveProgress(currentTime)
          }

          // Check if video is almost complete (95%)
          if (duration > 0 && currentTime / duration >= 0.95) {
            saveProgress(currentTime, true)
            onComplete?.()
          }
        }, 5000) // Save every 5 seconds
      })

      // Time update for quiz triggers
      player.on('timeupdate', () => {
        const currentTime = player.currentTime() || 0
        onTimeUpdate?.(currentTime)
      })

      player.on('pause', () => {
        // Clear interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }

        onPlayingChange?.(false)

        // Save progress immediately on pause
        const currentTime = player.currentTime() || 0
        saveProgress(currentTime)
      })

      // Expose pause/resume methods for external control (quiz overlay)
      if (onPauseRequest) {
        ;(player as any).externalPause = () => player.pause()
      }
      if (onResumeRequest) {
        ;(player as any).externalResume = () => player.play()
      }

      player.on('ended', () => {
        // Clear interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }

        // Mark as complete
        const currentTime = player.currentTime() || 0
        saveProgress(currentTime, true)
        onComplete?.()

        toast({
          title: 'Lekcija završena!',
          description: 'Uspješno ste završili ovu video lekciju.',
        })
      })

      player.on('error', (error: any) => {
        console.error('Video player error:', error)
        toast({
          title: 'Greška pri učitavanju videa',
          description: 'Molimo pokušajte ponovno.',
          variant: 'destructive',
        })
      })

      // Keyboard shortcuts
      player.on('keydown', (event: any) => {
        const e = event as KeyboardEvent

        switch (e.key) {
          case ' ':
          case 'k':
            // Play/Pause
            e.preventDefault()
            if (player.paused()) {
              player.play()
            } else {
              player.pause()
            }
            break

          case 'ArrowLeft':
            // Rewind 5 seconds
            e.preventDefault()
            player.currentTime(Math.max(0, (player.currentTime() || 0) - 5))
            break

          case 'ArrowRight':
            // Forward 5 seconds
            e.preventDefault()
            player.currentTime(
              Math.min(player.duration() || 0, (player.currentTime() || 0) + 5)
            )
            break

          case 'j':
            // Rewind 10 seconds
            e.preventDefault()
            player.currentTime(Math.max(0, (player.currentTime() || 0) - 10))
            break

          case 'l':
            // Forward 10 seconds
            e.preventDefault()
            player.currentTime(
              Math.min(player.duration() || 0, (player.currentTime() || 0) + 10)
            )
            break

          case 'ArrowUp':
            // Volume up
            e.preventDefault()
            player.volume(Math.min(1, (player.volume() || 0) + 0.1))
            break

          case 'ArrowDown':
            // Volume down
            e.preventDefault()
            player.volume(Math.max(0, (player.volume() || 0) - 0.1))
            break

          case 'm':
            // Mute/Unmute
            e.preventDefault()
            player.muted(!player.muted())
            break

          case 'f':
            // Fullscreen
            e.preventDefault()
            if (player.isFullscreen()) {
              player.exitFullscreen()
            } else {
              player.requestFullscreen()
            }
            break

          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            // Jump to percentage (0-90%)
            e.preventDefault()
            const percentage = parseInt(e.key) / 10
            player.currentTime((player.duration() || 0) * percentage)
            break
        }
      })
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        // Save progress one last time
        const currentTime = playerRef.current.currentTime() || 0
        saveProgress(currentTime)

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }

        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [
    videoUrl,
    videoProvider,
    poster,
    autoplay,
    initialPosition,
    lessonId,
    saveProgress,
    onComplete,
    toast,
    hasStarted,
  ])

  return (
    <div className="video-player-wrapper">
      <div ref={videoRef} className="rounded-lg overflow-hidden shadow-lg" />

      {/* Keyboard shortcuts info */}
      {isReady && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Prečice s tipkovnicom:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
            <div>
              <kbd className="px-2 py-1 bg-white border rounded">Space</kbd> /{' '}
              <kbd className="px-2 py-1 bg-white border rounded">K</kbd> - Play/Pause
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white border rounded">←</kbd> /{' '}
              <kbd className="px-2 py-1 bg-white border rounded">→</kbd> - ±5 sekundi
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white border rounded">J</kbd> /{' '}
              <kbd className="px-2 py-1 bg-white border rounded">L</kbd> - ±10 sekundi
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white border rounded">↑</kbd> /{' '}
              <kbd className="px-2 py-1 bg-white border rounded">↓</kbd> - Glasnoća
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white border rounded">M</kbd> - Mute/Unmute
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white border rounded">F</kbd> - Fullscreen
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white border rounded">0-9</kbd> - Skoči na %
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .video-js {
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 9;
        }

        .video-js .vjs-big-play-button {
          border-color: #3b82f6;
          background-color: rgba(59, 130, 246, 0.8);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          line-height: 80px;
          font-size: 40px;
          top: 50%;
          left: 50%;
          margin-top: -40px;
          margin-left: -40px;
        }

        .video-js .vjs-big-play-button:hover {
          background-color: rgba(59, 130, 246, 1);
        }

        .video-js .vjs-control-bar {
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
        }

        .video-js .vjs-progress-control .vjs-play-progress {
          background-color: #3b82f6;
        }

        .video-js .vjs-progress-control .vjs-load-progress {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .video-js .vjs-slider {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .video-js .vjs-volume-level {
          background-color: #3b82f6;
        }

        .video-js:hover .vjs-big-play-button {
          background-color: rgba(59, 130, 246, 1);
        }

        kbd {
          font-family: monospace;
          font-size: 0.875em;
        }
      `}</style>
    </div>
  )
}

import Bull from 'bull'
import { env } from '../config/env'
import { prisma } from '@edu-platforma/database'
import { notificationService } from './notificationService'

// Create the notification queue
const notificationQueue = env.REDIS_URL
  ? new Bull('notification-scheduler', env.REDIS_URL, {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    })
  : null

// Job types
interface SessionReminderJob {
  type: 'session_reminder'
  sessionId: string
  reminderType: '1_hour' | '15_minutes'
}

type NotificationJob = SessionReminderJob

// Process jobs
if (notificationQueue) {
  notificationQueue.process(async (job) => {
    const data = job.data as NotificationJob

    switch (data.type) {
      case 'session_reminder':
        await processSessionReminder(data)
        break
      default:
        console.error('Unknown job type:', data)
    }
  })

  notificationQueue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`)
  })

  notificationQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message)
  })

  console.log('✅ Notification scheduler initialized')
}

// Process session reminder
async function processSessionReminder(job: SessionReminderJob) {
  const session = await prisma.liveSession.findUnique({
    where: { id: job.sessionId },
    include: {
      instructor: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          id: true,
          enrollments: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  })

  if (!session || session.status !== 'SCHEDULED') {
    console.log(`Session ${job.sessionId} is no longer scheduled, skipping reminder`)
    return
  }

  const timeLabel = job.reminderType === '1_hour' ? '1 hour' : '15 minutes'
  const userIds: string[] = []

  // Get enrolled users if session is tied to a course
  if (session.course) {
    userIds.push(...session.course.enrollments.map((e) => e.userId))
  }

  // Also notify based on any study group members if applicable
  // For now, we'll notify enrolled users

  // Send notifications to all enrolled users
  for (const userId of userIds) {
    await notificationService.create({
      userId,
      type: 'SYSTEM',
      title: 'Live Session Reminder',
      message: `"${session.title}" starts in ${timeLabel}! Don't miss it.`,
      link: `/live/${session.id}`,
    })
  }

  console.log(`Sent ${timeLabel} reminder for session ${session.id} to ${userIds.length} users`)
}

// Schedule a session reminder
export async function scheduleSessionReminder(
  sessionId: string,
  scheduledStartTime: Date
) {
  if (!notificationQueue) {
    console.log('⚠️ Notification queue not available. Reminders will not be scheduled.')
    return
  }

  const now = new Date()
  const sessionTime = new Date(scheduledStartTime)

  // Schedule 1 hour before reminder
  const oneHourBefore = new Date(sessionTime.getTime() - 60 * 60 * 1000)
  if (oneHourBefore > now) {
    const delay = oneHourBefore.getTime() - now.getTime()
    await notificationQueue.add(
      {
        type: 'session_reminder',
        sessionId,
        reminderType: '1_hour',
      } as SessionReminderJob,
      {
        delay,
        jobId: `session-reminder-1h-${sessionId}`,
      }
    )
    console.log(`📅 Scheduled 1-hour reminder for session ${sessionId}`)
  }

  // Schedule 15 minutes before reminder
  const fifteenMinutesBefore = new Date(sessionTime.getTime() - 15 * 60 * 1000)
  if (fifteenMinutesBefore > now) {
    const delay = fifteenMinutesBefore.getTime() - now.getTime()
    await notificationQueue.add(
      {
        type: 'session_reminder',
        sessionId,
        reminderType: '15_minutes',
      } as SessionReminderJob,
      {
        delay,
        jobId: `session-reminder-15m-${sessionId}`,
      }
    )
    console.log(`📅 Scheduled 15-minute reminder for session ${sessionId}`)
  }
}

// Cancel scheduled reminders for a session
export async function cancelSessionReminders(sessionId: string) {
  if (!notificationQueue) return

  try {
    // Remove jobs by their IDs
    const job1h = await notificationQueue.getJob(`session-reminder-1h-${sessionId}`)
    const job15m = await notificationQueue.getJob(`session-reminder-15m-${sessionId}`)

    if (job1h) await job1h.remove()
    if (job15m) await job15m.remove()

    console.log(`🗑️ Cancelled reminders for session ${sessionId}`)
  } catch (error) {
    console.error(`Failed to cancel reminders for session ${sessionId}:`, error)
  }
}

// Export the queue for graceful shutdown
export { notificationQueue }

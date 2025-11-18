'use client'

import { useState, useEffect } from 'react'

interface LearningStreak {
  id: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  dailyGoalMinutes: number
  dailyGoalLessons: number
  freezeDaysAvailable: number
  freezeDaysUsed: number
  totalDaysActive: number
  totalMinutesLearned: number
  totalLessonsCompleted: number
  streakMilestones: number[]
  dailyActivities: DailyActivity[]
}

interface DailyActivity {
  id: string
  date: string
  minutesLearned: number
  lessonsCompleted: number
  quizzesCompleted: number
  pointsEarned: number
  goalMet: boolean
  usedFreeze: boolean
}

interface PeriodStats {
  totalMinutes: number
  totalLessons: number
  totalQuizzes: number
  totalPoints: number
  daysActive: number
  averageMinutes: number
}

interface Milestone {
  days: number
  rewardType: string
  rewardValue: string
  label: string
  daysRemaining: number
}

interface StreakReward {
  id: string
  milestone: number
  rewardType: string
  rewardValue: string
  claimedAt: string | null
}

interface Statistics {
  streak: LearningStreak
  weeklyStats: PeriodStats
  monthlyStats: PeriodStats
  rewards: StreakReward[]
  upcomingMilestones: Milestone[]
}

interface LeaderboardEntry {
  rank: number
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }
  currentStreak: number
  longestStreak: number
  totalDaysActive: number
}

interface StreakDashboardProps {
  apiBaseUrl?: string
  token?: string
}

export default function StreakDashboard({
  apiBaseUrl = '/api',
  token,
}: StreakDashboardProps) {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [calendar, setCalendar] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'leaderboard'>('overview')
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalMinutes, setGoalMinutes] = useState(15)
  const [goalLessons, setGoalLessons] = useState(1)

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date())

  useEffect(() => {
    fetchStatistics()
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    fetchCalendar()
  }, [calendarDate])

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  })

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${apiBaseUrl}/streaks/statistics`, { headers: getHeaders() })
      const data = await res.json()
      if (data.success) {
        setStatistics(data.data)
        setGoalMinutes(data.data.streak.dailyGoalMinutes)
        setGoalLessons(data.data.streak.dailyGoalLessons)
      }
    } catch (err) {
      console.error('Error fetching statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/streaks/leaderboard`, { headers: getHeaders() })
      const data = await res.json()
      if (data.success) {
        setLeaderboard(data.data)
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    }
  }

  const fetchCalendar = async () => {
    try {
      const year = calendarDate.getFullYear()
      const month = calendarDate.getMonth() + 1
      const res = await fetch(`${apiBaseUrl}/streaks/calendar/${year}/${month}`, {
        headers: getHeaders(),
      })
      const data = await res.json()
      if (data.success) {
        setCalendar(data.data)
      }
    } catch (err) {
      console.error('Error fetching calendar:', err)
    }
  }

  const useFreeze = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/streaks/freeze`, {
        method: 'POST',
        headers: getHeaders(),
      })
      const data = await res.json()
      if (data.success) {
        fetchStatistics()
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error('Error using freeze:', err)
    }
  }

  const updateGoals = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/streaks/goals`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          dailyGoalMinutes: goalMinutes,
          dailyGoalLessons: goalLessons,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowGoalModal(false)
        fetchStatistics()
      }
    } catch (err) {
      console.error('Error updating goals:', err)
    }
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 100) return 'text-purple-600'
    if (streak >= 30) return 'text-yellow-500'
    if (streak >= 7) return 'text-orange-500'
    return 'text-gray-600'
  }

  const renderCalendar = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()

    const days = []

    // Empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const activity = calendar[dateStr]
      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year

      let bgColor = 'bg-gray-100'
      let icon = null

      if (activity) {
        if (activity.goalMet) {
          bgColor = activity.usedFreeze ? 'bg-blue-100' : 'bg-green-100'
          icon = activity.usedFreeze ? '❄️' : '✓'
        } else if (activity.minutesLearned > 0) {
          bgColor = 'bg-yellow-100'
          icon = '~'
        }
      }

      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center rounded-lg relative ${bgColor} ${
            isToday ? 'ring-2 ring-blue-500' : ''
          }`}
          title={
            activity
              ? `${activity.minutesLearned} min, ${activity.lessonsCompleted} lessons`
              : 'No activity'
          }
        >
          <span className="text-sm">{day}</span>
          {icon && (
            <span className="absolute bottom-0 right-0 text-xs">{icon}</span>
          )}
        </div>
      )
    }

    return days
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="text-center text-gray-500 py-8">
        Unable to load streak data
      </div>
    )
  }

  const { streak, weeklyStats, monthlyStats, rewards, upcomingMilestones } = statistics

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header with streak count */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90">Current Streak</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{streak.currentStreak}</span>
              <span className="text-xl">days</span>
            </div>
            <p className="text-sm opacity-75 mt-1">
              Longest: {streak.longestStreak} days
            </p>
          </div>
          <div className="text-6xl">🔥</div>
        </div>

        {/* Today's progress */}
        {streak.dailyActivities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <span>Today's Goal</span>
              <span>
                {streak.dailyActivities[0]?.goalMet ? '✓ Completed' : 'In progress'}
              </span>
            </div>
            <div className="mt-2 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (streak.dailyActivities[0]?.minutesLearned / streak.dailyGoalMinutes) * 100
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1 opacity-75">
              <span>{streak.dailyActivities[0]?.minutesLearned || 0} min</span>
              <span>{streak.dailyGoalMinutes} min goal</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'calendar', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg capitalize ${
              activeTab === tab
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex-1 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">Daily Goals</div>
              <div className="text-sm text-gray-500">
                {streak.dailyGoalMinutes} min / {streak.dailyGoalLessons} lesson
              </div>
            </button>
            <button
              onClick={useFreeze}
              disabled={streak.freezeDaysAvailable === 0}
              className="flex-1 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">❄️</div>
              <div className="font-medium">Freeze Days</div>
              <div className="text-sm text-gray-500">
                {streak.freezeDaysAvailable} available
              </div>
            </button>
          </div>

          {/* Statistics cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">This Week</div>
              <div className="text-2xl font-bold">{weeklyStats.totalMinutes}</div>
              <div className="text-xs text-gray-500">minutes</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">This Month</div>
              <div className="text-2xl font-bold">{monthlyStats.totalMinutes}</div>
              <div className="text-xs text-gray-500">minutes</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Lessons</div>
              <div className="text-2xl font-bold">{monthlyStats.totalLessons}</div>
              <div className="text-xs text-gray-500">this month</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Points</div>
              <div className="text-2xl font-bold">{monthlyStats.totalPoints}</div>
              <div className="text-xs text-gray-500">earned</div>
            </div>
          </div>

          {/* Upcoming milestones */}
          {upcomingMilestones.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-4">Upcoming Milestones</h3>
              <div className="space-y-3">
                {upcomingMilestones.map((milestone) => (
                  <div key={milestone.days} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {milestone.rewardType === 'badge' ? '🏆' :
                         milestone.rewardType === 'points' ? '⭐' : '❄️'}
                      </div>
                      <div>
                        <div className="font-medium">{milestone.label}</div>
                        <div className="text-sm text-gray-500">
                          {milestone.rewardType === 'points'
                            ? `${milestone.rewardValue} points`
                            : milestone.rewardType === 'freeze_day'
                            ? `${milestone.rewardValue} freeze day(s)`
                            : 'Special badge'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{milestone.daysRemaining}</div>
                      <div className="text-xs text-gray-500">days left</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earned rewards */}
          {rewards.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-4">Earned Rewards</h3>
              <div className="flex flex-wrap gap-2">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                  >
                    {reward.milestone} days
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))
              }
              className="p-2 hover:bg-gray-100 rounded"
            >
              &lt;
            </button>
            <h3 className="font-medium">
              {calendarDate.toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() =>
                setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))
              }
              className="p-2 hover:bg-gray-100 rounded"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded" />
              <span>Goal met</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 rounded" />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 rounded" />
              <span>Freeze used</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium">Streak Leaderboard</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1
                        ? 'bg-yellow-100 text-yellow-700'
                        : entry.rank === 2
                        ? 'bg-gray-200 text-gray-700'
                        : entry.rank === 3
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div className="flex items-center gap-3">
                    {entry.user.avatar ? (
                      <img
                        src={entry.user.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {entry.user.firstName?.charAt(0)}
                        {entry.user.lastName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {entry.user.firstName} {entry.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.totalDaysActive} days active
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getStreakColor(entry.currentStreak)}`}>
                    {entry.currentStreak} 🔥
                  </div>
                  <div className="text-xs text-gray-500">
                    Best: {entry.longestStreak}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal settings modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Daily Goals</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minutes per day
                </label>
                <input
                  type="number"
                  value={goalMinutes}
                  onChange={(e) => setGoalMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="5"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lessons per day
                </label>
                <input
                  type="number"
                  value={goalLessons}
                  onChange={(e) => setGoalLessons(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={updateGoals}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

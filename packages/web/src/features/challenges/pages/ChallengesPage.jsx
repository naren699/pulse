import { useEffect, useState } from 'react'
import { useAuth } from '@pulse/shared/context'
import { useChallenges } from '@pulse/shared/hooks'
import { markChallengeDone, difficultyBreakdown } from '@pulse/shared/services'
import ChallengeCard from '../components/ChallengeCard'
import StreakBadge from '../components/StreakBadge'
import ChallengeHeatmap from '../components/ChallengeHeatmap'
import DifficultyBreakdown from '../components/DifficultyBreakdown'
import Button from '../../../shared/components/Button'
import { PageSpinner } from '../../../shared/components/Spinner'
import { useToast } from '../../../shared/components/Toast'

export default function ChallengesPage() {
  const { user } = useAuth()
  const showToast = useToast()
  const { challenges, todaysChallenge, todaysProgress, completions, streakStats, loading } = useChallenges(user?.uid)
  const [marking, setMarking] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [viewIndex, setViewIndex] = useState(null)
  const isDoneToday = todaysProgress?.status === 'done'

  // Challenges are ordered easy → hard; default the view to today's pick.
  useEffect(() => {
    if (viewIndex === null && todaysChallenge && challenges.length) {
      setViewIndex(challenges.findIndex((c) => c.id === todaysChallenge.id))
    }
  }, [viewIndex, todaysChallenge, challenges])

  const activeIndex = viewIndex ?? 0
  const viewedChallenge = challenges[activeIndex] || todaysChallenge
  const isLast = activeIndex >= challenges.length - 1
  const breakdown = difficultyBreakdown(completions, challenges)

  // Browsing ahead unlocks only after today's challenge is solved, and never
  // touches the streak itself — it's just navigation through the bank.
  const handleNextChallenge = () => setViewIndex((i) => Math.min((i ?? 0) + 1, challenges.length - 1))

  const handleMarkDone = async () => {
    setMarking(true)
    try {
      const next = await markChallengeDone(user.uid, viewedChallenge.id)
      setCelebrating(true)
      showToast(`Streak! ${next.currentStreak} day${next.currentStreak === 1 ? '' : 's'} 🔥`, 'streak')
      if ([5, 10, 20, 30, 50, 100].includes(next.currentStreak)) {
        setTimeout(() => showToast(`🎉 Milestone: ${next.currentStreak}-day streak!`, 'streak'), 600)
      }
      setTimeout(() => setCelebrating(false), 2000)
    } catch (err) {
      console.error(err)
      showToast('Could not save progress. Are Firebase keys configured?', 'error')
    } finally {
      setMarking(false)
    }
  }

  if (loading) return <PageSpinner label="Loading today's challenge…" />

  return (
    <div className="hero-spot mx-auto max-w-[820px]" style={{ '--accent': '#8b5cf6' }}>
      <div className="mb-10 text-center">
        <p className="label-caps mb-2">Challenge {activeIndex + 1} of {challenges.length} · Easy → Medium → Hard</p>
        <h1 className="font-display text-4xl font-bold tracking-[0.02em]">
          Daily <span className="text-gradient">Coding Challenge</span>
        </h1>
      </div>

      <div className="flex flex-col gap-8">
        <ChallengeCard
          challenge={viewedChallenge}
          todaysProgress={todaysProgress}
          onMarkDone={handleMarkDone}
          marking={marking}
          celebrating={celebrating}
          isPreview={isDoneToday && viewedChallenge?.id !== todaysChallenge?.id}
        />
        <div className="mx-auto -mt-4 flex max-w-[600px] flex-col items-center gap-2">
          {isDoneToday ? (
            <Button variant="secondary" onClick={handleNextChallenge} disabled={isLast}>
              {isLast ? '🎉 Last challenge' : 'Next Challenge →'}
            </Button>
          ) : (
            <p className="text-xs text-text-subtle">Solve today's challenge to unlock the next one</p>
          )}
        </div>
        <StreakBadge
          currentStreak={streakStats.currentStreak}
          longestStreak={streakStats.longestStreak}
          totalCompleted={streakStats.totalCompleted}
          celebrating={celebrating}
        />
        <DifficultyBreakdown counts={breakdown} />
        <ChallengeHeatmap completions={completions} />
      </div>
    </div>
  )
}

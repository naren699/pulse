import { DifficultyBadge, TagBadge } from '../../../shared/components/Badge'
import Button from '../../../shared/components/Button'
import Icon from '../../../shared/components/Icon'
import Confetti from '../../../shared/components/Confetti'
import { formatTime } from '../../../shared/utils/dates'

export default function ChallengeCard({ challenge, todaysProgress, onMarkDone, marking, celebrating, isPreview = false }) {
  if (!challenge) return null
  const isDone = todaysProgress?.status === 'done'

  return (
    <div className="card-elevated relative mx-auto w-full max-w-[640px] overflow-hidden p-9" style={{ '--accent': '#a855f7' }}>
      {celebrating && <Confetti />}
      <p className="label-caps mb-3">{isPreview ? '💡 Bonus Challenge' : "Today's Challenge"}</p>
      <h2 className="font-display text-[32px] font-bold leading-10 tracking-[-0.02em] text-gradient">{challenge.title}</h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={challenge.difficulty} />
        {challenge.topic && <TagBadge>{challenge.topic}</TagBadge>}
      </div>

      {challenge.description && (
        <p className="mt-4 text-sm leading-relaxed text-text-tertiary">{challenge.description}</p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <a href={challenge.url} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary">
            Solve on LeetCode <Icon name="external" size={14} />
          </Button>
        </a>
        <span className={`text-sm font-medium ${isDone ? 'text-emerald-300' : 'text-text-subtle'}`}>
          {isPreview
            ? '💡 Extra practice — solve it anytime'
            : isDone
              ? `✓ Done${todaysProgress?.completedAt ? ` at ${formatTime(todaysProgress.completedAt)}` : ''}`
              : '✗ Not done yet'}
        </span>
      </div>

      {!isDone && (
        <Button fullWidth size="lg" className="mt-6" onClick={onMarkDone} loading={marking}>
          ✓ I Solved It
        </Button>
      )}
    </div>
  )
}

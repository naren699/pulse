import Icon from '../../../shared/components/Icon'
import { TagBadge } from '../../../shared/components/Badge'
import { countdownText, formatDateRange } from '../../../shared/utils/dates'

export default function HackathonCard({ hackathon, isAdmin, onDelete, past = false }) {
  return (
    <div
      className={`card-glass group relative flex flex-col overflow-hidden transition-all hover:scale-[1.02] hover:border-primary/25 hover:shadow-[0_20px_48px_rgba(99,102,241,0.12)] ${past ? 'opacity-60' : ''}`}
    >
      <div className="relative h-[140px] shrink-0 overflow-hidden">
        {hackathon.coverImageUrl ? (
          <img
            src={hackathon.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-[0.8]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-orange/45 via-accent/30 to-secondary/35" />
        )}
        {isAdmin && (
          <button
            onClick={() => onDelete(hackathon)}
            className="absolute right-2 top-2 rounded-lg bg-bg-dark/60 p-2 text-text-tertiary opacity-0 backdrop-blur transition-all hover:text-red-300 group-hover:opacity-100"
            aria-label={`Delete ${hackathon.title}`}
          >
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-display text-base font-semibold" title={hackathon.title}>
          {hackathon.title}
        </h3>
        <p className="mt-0.5 text-xs text-text-tertiary">
          {formatDateRange(hackathon.startAt, hackathon.endAt)}
          {hackathon.location ? ` · ${hackathon.location}` : ''}
        </p>
        <p className="mt-2 text-sm font-semibold text-primary-light">{countdownText(hackathon.startAt, hackathon.endAt)}</p>

        {hackathon.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hackathon.tags.slice(0, 4).map((tag) => (
              <TagBadge key={tag}>{tag}</TagBadge>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          <a
            href={hackathon.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-gradient-to-r from-orange to-accent px-4 py-2.5 font-display text-sm font-semibold text-white shadow-[0_10px_32px_-8px_rgba(255,157,92,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-8px_rgba(255,122,217,0.6)] active:scale-[0.98]"
          >
            Register <Icon name="external" size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}

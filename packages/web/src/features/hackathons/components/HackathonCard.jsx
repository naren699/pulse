import Icon from '../../../shared/components/Icon'
import { TagBadge } from '../../../shared/components/Badge'
import { countdownText, formatDateRange } from '@pulse/shared/utils'

export default function HackathonCard({ hackathon, isAdmin, onOpen, onEdit, onDelete, past = false }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(hackathon)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen?.(hackathon)}
      className={`card-glass group relative flex cursor-pointer flex-col overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] ${past ? 'opacity-60' : ''}`}
    >
      <div className="relative h-[140px] shrink-0 overflow-hidden">
        {hackathon.coverImageUrl ? (
          <img
            src={hackathon.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-[0.8]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/35 via-primary/15 to-transparent" />
        )}
        {isAdmin && (
          <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-all group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(hackathon) }}
              className="rounded-lg bg-bg-dark/60 p-2 text-text-tertiary backdrop-blur transition-all hover:text-primary-light"
              aria-label={`Edit ${hackathon.title}`}
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(hackathon) }}
              className="rounded-lg bg-bg-dark/60 p-2 text-text-tertiary backdrop-blur transition-all hover:text-red-300"
              aria-label={`Delete ${hackathon.title}`}
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
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
            onClick={(e) => e.stopPropagation()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 font-display text-sm font-semibold text-white transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
          >
            Register <Icon name="external" size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}

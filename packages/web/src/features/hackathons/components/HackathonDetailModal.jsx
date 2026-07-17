import Modal from '../../../shared/components/Modal'
import Button from '../../../shared/components/Button'
import Icon from '../../../shared/components/Icon'
import { TagBadge } from '../../../shared/components/Badge'
import { countdownText, formatDateRange } from '@pulse/shared/utils'

export default function HackathonDetailModal({ hackathon, isAdmin, onClose, onEdit, onDelete }) {
  if (!hackathon) return null

  return (
    <Modal isOpen={Boolean(hackathon)} onClose={onClose} title={hackathon.title} maxWidth="max-w-[620px]">
      {hackathon.coverImageUrl && (
        <img
          src={hackathon.coverImageUrl}
          alt=""
          className="mb-5 h-48 w-full rounded-xl object-cover"
        />
      )}

      <p className="mb-1 text-xs text-text-tertiary">
        {formatDateRange(hackathon.startAt, hackathon.endAt)}
        {hackathon.location ? ` · ${hackathon.location}` : ''}
      </p>
      <p className="mb-4 text-sm font-semibold text-primary-light">
        {countdownText(hackathon.startAt, hackathon.endAt)}
      </p>

      {hackathon.tags?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {hackathon.tags.map((tag) => (
            <TagBadge key={tag}>{tag}</TagBadge>
          ))}
        </div>
      )}

      {hackathon.description && (
        <p className="mb-5 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
          {hackathon.description}
        </p>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {hackathon.registrationDeadline && (
          <div>
            <p className="label-caps mb-1 text-[10px]">Registration Deadline</p>
            <p className="text-sm text-text-secondary">{formatDateRange(hackathon.registrationDeadline)}</p>
          </div>
        )}
        {hackathon.payment && (
          <div>
            <p className="label-caps mb-1 text-[10px]">Payment</p>
            <p className="text-sm text-text-secondary">{hackathon.payment}</p>
          </div>
        )}
        {hackathon.websiteUrl && (
          <div>
            <p className="label-caps mb-1 text-[10px]">Website</p>
            <a
              href={hackathon.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-light hover:underline"
            >
              {hackathon.websiteUrl} <Icon name="external" size={12} />
            </a>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {isAdmin && (
          <>
            <Button type="button" variant="secondary" onClick={() => onEdit(hackathon)}>
              <Icon name="edit" size={14} /> Edit
            </Button>
            <Button type="button" variant="secondary" onClick={() => onDelete(hackathon)}>
              <Icon name="trash" size={14} /> Delete
            </Button>
          </>
        )}
        <a
          href={hackathon.registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-semibold text-white transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
        >
          Register <Icon name="external" size={14} />
        </a>
      </div>
    </Modal>
  )
}

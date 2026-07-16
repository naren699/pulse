import Icon from '../../../shared/components/Icon'
import { toDateId } from '../../../shared/utils/dates'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DOT = {
  present: 'bg-success',
  absent: 'bg-danger',
  none: 'bg-slate-500/40',
}

export default function CalendarGrid({ month, year, sessionsByDate, onPrev, onNext, onDayClick }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayId = toDateId()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="card-glass p-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onPrev} className="rounded-lg p-2 text-text-tertiary hover:bg-slate-200/10 hover:text-text-primary" aria-label="Previous month">
          <Icon name="chevronLeft" size={18} />
        </button>
        <h3 className="font-display text-base font-semibold">
          {MONTHS[month]} {year}
        </h3>
        <button onClick={onNext} className="rounded-lg p-2 text-text-tertiary hover:bg-slate-200/10 hover:text-text-primary" aria-label="Next month">
          <Icon name="chevronRight" size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="label-caps py-1 text-[10px]">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} />
          const dateId = toDateId(new Date(year, month, day))
          const status = sessionsByDate[dateId]?.status || 'none'
          const isToday = dateId === todayId
          const isFuture = dateId > todayId
          return (
            <button
              key={dateId}
              onClick={() => !isFuture && onDayClick(dateId, status)}
              disabled={isFuture}
              className={[
                'relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors',
                isFuture ? 'cursor-default text-text-subtle/50' : 'cursor-pointer text-text-secondary hover:bg-slate-200/10',
                isToday ? 'border border-primary/60 font-bold text-text-primary' : '',
              ].join(' ')}
              title={status === 'none' ? dateId : `${status} on ${dateId}`}
            >
              {day}
              {!isFuture && <span className={`absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ${DOT[status]}`} />}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-text-tertiary">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Present</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" /> Absent</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-500/40" /> No mark</span>
      </div>
    </div>
  )
}

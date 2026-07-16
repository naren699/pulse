import { useMemo } from 'react'
import { toDateId, fromDateId } from '../../../shared/utils/dates'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEKS = 12

// 12-week completion heatmap: rows are weeks (oldest first), columns Sun-Sat.
export default function ChallengeHeatmap({ completions }) {
  const doneDates = useMemo(
    () => new Set(completions.filter((c) => c.status === 'done').map((c) => c.id)),
    [completions],
  )

  const weeks = useMemo(() => {
    const today = fromDateId(toDateId())
    // End the grid on the Saturday of the current week.
    const end = new Date(today)
    end.setDate(end.getDate() + (6 - end.getDay()))
    const grid = []
    for (let w = WEEKS - 1; w >= 0; w--) {
      const row = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(end)
        date.setDate(end.getDate() - w * 7 - (6 - d))
        row.push({ dateId: toDateId(date), future: date > today })
      }
      grid.push(row)
    }
    return grid
  }, [])

  return (
    <div className="card-glass mx-auto max-w-[600px] p-6">
      <p className="label-caps mb-4">Completion Heatmap · Last 12 Weeks</p>
      <div className="flex justify-center">
        <div>
          <div className="mb-1 grid grid-cols-7 gap-[3px]">
            {DAY_LABELS.map((d, i) => (
              <span key={i} className="w-4 text-center text-[9px] text-text-subtle">{d}</span>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="mb-[3px] grid grid-cols-7 gap-[3px]">
              {week.map(({ dateId, future }) => {
                const done = doneDates.has(dateId)
                return (
                  <span
                    key={dateId}
                    title={done ? `Completed on ${dateId}` : future ? dateId : `No completion on ${dateId}`}
                    className={[
                      'h-4 w-4 rounded-[3px] transition-transform hover:scale-125',
                      done ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]' : future ? 'bg-bg-primary' : 'bg-slate-400/20',
                    ].join(' ')}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-text-tertiary">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-success" /> Completed</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-slate-400/20" /> Missed</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-bg-primary" /> Upcoming</span>
      </div>
    </div>
  )
}

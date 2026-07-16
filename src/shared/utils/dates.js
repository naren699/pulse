// Date helpers. All per-day records key on a local-timezone "YYYY-MM-DD"
// dateId so a day boundary matches what the student actually experiences.

export function toDateId(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateId(dateId) {
  const [y, m, d] = dateId.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function daysBetween(dateIdA, dateIdB) {
  const ms = fromDateId(dateIdB) - fromDateId(dateIdA)
  return Math.round(ms / 86400000)
}

export function formatDateLong(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(date) {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDateRange(startAt, endAt) {
  const start = formatDateShort(startAt)
  if (!endAt) return start
  return `${start} – ${formatDateShort(endAt)}`
}

export function formatTime(date) {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function calculateCountdown(startAt, now = new Date()) {
  const start = startAt?.toDate ? startAt.toDate() : new Date(startAt)
  const diff = start - now
  const abs = Math.abs(diff)
  const days = Math.floor(abs / 86400000)
  const hours = Math.floor((abs % 86400000) / 3600000)
  const minutes = Math.floor((abs % 3600000) / 60000)
  return { days, hours, minutes, isPast: diff < 0 }
}

export function countdownText(startAt, endAt, now = new Date()) {
  const { days, hours, isPast } = calculateCountdown(startAt, now)
  if (!isPast) {
    if (days === 0 && hours === 0) return 'Starting soon!'
    if (days === 0) return `Starts in ${hours} hour${hours === 1 ? '' : 's'}`
    return `Starts in ${days} day${days === 1 ? '' : 's'}${hours ? `, ${hours}h` : ''}`
  }
  const end = endAt?.toDate ? endAt.toDate() : endAt ? new Date(endAt) : null
  if (end && end < now) return 'Ended'
  if (end) return 'Happening now'
  return `Started ${days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`}`
}

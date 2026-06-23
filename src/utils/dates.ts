export function formatDisplayDate(value: string | null | undefined) {
  if (!value) {
    return 'Date unavailable'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

export function formatDisplayYear(value: string | null | undefined) {
  if (!value) {
    return 'Year unavailable'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Year unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
  }).format(parsed)
}

export function getIsoDate(daysFromToday = 0) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + daysFromToday)

  return date.toISOString().slice(0, 10)
}

export function formatCalendarDateHeading(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(parsed)
}

export function formatDaysUntilLabel(daysUntil: number | null | undefined) {
  if (daysUntil === null || daysUntil === undefined) {
    return 'Schedule pending'
  }

  if (daysUntil <= 0) {
    return daysUntil === 0 ? 'Today' : 'Recently aired'
  }

  if (daysUntil === 1) {
    return 'Tomorrow'
  }

  return `In ${daysUntil} days`
}

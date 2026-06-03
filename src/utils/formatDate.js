export function formatDateBRT(utcString) {
  if (!utcString) return '—'
  const date = new Date(utcString)
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTimeBRT(utcString) {
  if (!utcString) return '—'
  const date = new Date(utcString)
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isMatchStarted(kickoffUtc) {
  if (!kickoffUtc) return false
  return new Date(kickoffUtc) < new Date()
}

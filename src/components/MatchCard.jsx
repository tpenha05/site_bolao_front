import { Link } from 'react-router-dom'
import { formatDateBRT, isMatchStarted } from '../utils/formatDate'
import TeamFlag from './TeamFlag'

function StatusBadge({ match }) {
  if (match.finished) {
    return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Encerrado</span>
  }
  if (isMatchStarted(match.kickoff_utc)) {
    return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full animate-pulse">Ao vivo</span>
  }
  return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Em aberto</span>
}

function BetBadge({ bet }) {
  if (!bet) return <span className="text-xs text-gray-400">Sem aposta</span>
  return (
    <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">
      {bet.predicted_home_score} × {bet.predicted_away_score}
    </span>
  )
}

export default function MatchCard({ match, competitionId, bet }) {
  const raw = match.data || {}
  const started = isMatchStarted(match.kickoff_utc)

  // Quando o team object não veio (knockout sem time definido), usa o
  // home_team_label/away_team_label da API (ex: "Winner Group A").
  const labelFallback = (labelKey) => {
    const label = raw[labelKey]
    if (!label) return null
    return { id: '0', name_en: label, fifa_code: '', flag: null }
  }
  const homeTeam = match.home_team ?? labelFallback('home_team_label')
  const awayTeam = match.away_team ?? labelFallback('away_team_label')

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <StatusBadge match={match} />
        <span className="text-xs text-gray-400">{formatDateBRT(match.kickoff_utc)}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex justify-center">
          <TeamFlag team={homeTeam} size="sm" />
        </div>

        <div className="text-center px-2 min-w-[48px]">
          {match.finished ? (
            <div className="text-lg font-bold text-gray-800">
              {raw.home_score ?? '—'} × {raw.away_score ?? '—'}
            </div>
          ) : (
            <div className="text-gray-300 text-lg font-light">vs</div>
          )}
        </div>

        <div className="flex-1 flex justify-center">
          <TeamFlag team={awayTeam} size="sm" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <BetBadge bet={bet} />
        {!started && competitionId && (
          <Link
            to={`/competitions/${competitionId}/bet/${match.match_id}`}
            className="text-xs px-3 py-1 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
          >
            Apostar
          </Link>
        )}
        {started && competitionId && !bet && (
          <span className="text-xs text-gray-400 italic">Jogo iniciado</span>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDateBRT, isMatchStarted } from '../utils/formatDate'
import TeamFlag from './TeamFlag'
import Modal from './Modal'

function StatusBadge({ match }) {
  if (match.finished) {
    return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Encerrado</span>
  }
  if (isMatchStarted(match.kickoff_utc)) {
    return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full animate-pulse">Ao vivo</span>
  }
  return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Em aberto</span>
}

function classifierName(bet, homeTeam, awayTeam) {
  if (bet?.predicted_classifier === 'home') return homeTeam?.name_en || 'Casa'
  if (bet?.predicted_classifier === 'away') return awayTeam?.name_en || 'Fora'
  return null
}

function BetBadge({ bet, homeTeam, awayTeam }) {
  if (!bet) return <span className="text-xs text-gray-400">Sem aposta</span>
  const classified = classifierName(bet, homeTeam, awayTeam)
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">
        {bet.predicted_home_score} × {bet.predicted_away_score}
      </span>
      {classified && (
        <span className="text-[10px] text-gray-500 px-2 leading-tight">
          Classificado: {classified}
        </span>
      )}
    </div>
  )
}

function OtherBetsModal({ open, onClose, match, homeTeam, awayTeam, allBets, currentUserId }) {
  const others = (allBets ?? []).filter(b => b.user_id !== currentUserId)
  return (
    <Modal open={open} onClose={onClose} title="Apostas dos participantes">
      <div className="mb-4 text-center text-xs text-gray-500">
        {homeTeam?.name_en || 'Casa'} × {awayTeam?.name_en || 'Fora'}
      </div>
      {others.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">
          Nenhum outro participante apostou neste jogo.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
          {others.map(b => (
            <li key={b.user_id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{b.user_name}</p>
                {classifierName(b, homeTeam, awayTeam) && (
                  <p className="text-[11px] text-gray-500 truncate">
                    Classificado: {classifierName(b, homeTeam, awayTeam)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-800">
                  {b.predicted_home_score} × {b.predicted_away_score}
                </span>
                {b.points != null && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">
                    {b.points} pt{b.points === 1 ? '' : 's'}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

export default function MatchCard({ match, competitionId, bet, allBets, currentUserId }) {
  const raw = match.data || {}
  const started = isMatchStarted(match.kickoff_utc)
  const [showOthers, setShowOthers] = useState(false)

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

      <div className="mt-3 flex items-center justify-between gap-2">
        <BetBadge bet={bet} homeTeam={homeTeam} awayTeam={awayTeam} />
        {!started && competitionId && (
          <Link
            to={`/competitions/${competitionId}/bet/${match.match_id}`}
            className="text-xs px-3 py-1 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium flex-shrink-0"
          >
            Apostar
          </Link>
        )}
        {started && competitionId && (
          <button
            onClick={() => setShowOthers(true)}
            className="text-xs px-3 py-1 border border-brand-200 text-brand-700 rounded-lg hover:bg-brand-50 transition-colors font-medium flex-shrink-0"
          >
            Ver apostas
          </button>
        )}
      </div>

      {started && competitionId && (
        <OtherBetsModal
          open={showOthers}
          onClose={() => setShowOthers(false)}
          match={match}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          allBets={allBets}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}

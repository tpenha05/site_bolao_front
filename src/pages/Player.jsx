import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useCompetitionBets } from '../hooks/useBets'
import { useMatches } from '../hooks/useMatches'
import { summarize, categorize } from '../utils/breakdown'
import { formatDateBRT } from '../utils/formatDate'
import TeamFlag from '../components/TeamFlag'

const ALL_ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const ROUND_LABELS = {
  1: 'Rodada 1', 2: 'Rodada 2', 3: 'Rodada 3',
  4: 'Round of 32', 5: 'Oitavas', 6: 'Quartas',
  7: 'Semifinais', 8: '3º Lugar', 9: 'Final',
}

function CategoryBadge({ points }) {
  const cat = categorize(points)
  if (!cat) return null
  const cls = cat.exato
    ? 'bg-emerald-100 text-emerald-700'
    : cat.resultado
      ? 'bg-blue-100 text-blue-700'
      : cat.classificado
        ? 'bg-amber-100 text-amber-700'
        : 'bg-gray-100 text-gray-500'
  const label = cat.exato
    ? 'Placar exato'
    : cat.resultado
      ? 'Resultado'
      : cat.classificado
        ? 'Classificado'
        : 'Errou'
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {label}
    </span>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
      <p className={`text-2xl font-bold ${accent || 'text-gray-800'}`}>{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

function classifierName(bet, homeTeam, awayTeam) {
  if (bet?.predicted_classifier === 'home') return homeTeam?.name_en || 'Casa'
  if (bet?.predicted_classifier === 'away') return awayTeam?.name_en || 'Fora'
  return null
}

function BetRow({ match, bet, homeTeam, awayTeam }) {
  const raw = match.data || {}
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-gray-400">{formatDateBRT(match.kickoff_utc)}</span>
        <div className="flex items-center gap-1.5">
          <CategoryBadge points={bet?.points} />
          {bet?.points != null && (
            <span className="text-[11px] px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-semibold">
              {bet.points} pt{bet.points === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex justify-center">
          <TeamFlag team={homeTeam} size="sm" />
        </div>
        <div className="text-center px-2 min-w-[90px]">
          {match.finished ? (
            <div className="text-base font-bold text-gray-800">
              {raw.home_score ?? '—'} × {raw.away_score ?? '—'}
            </div>
          ) : (
            <div className="text-gray-300 text-base">vs</div>
          )}
          {bet && (
            <div className="text-[11px] text-gray-500 mt-0.5">
              Apostou {bet.predicted_home_score} × {bet.predicted_away_score}
            </div>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <TeamFlag team={awayTeam} size="sm" />
        </div>
      </div>

      {classifierName(bet, homeTeam, awayTeam) && (
        <p className="text-[11px] text-gray-500 mt-2 text-center">
          Classificado: <span className="text-gray-700">{classifierName(bet, homeTeam, awayTeam)}</span>
        </p>
      )}
    </div>
  )
}

export default function Player() {
  const { id, userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [competition, setCompetition] = useState(null)
  const [loadingComp, setLoadingComp] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | number

  const { betsData, loading: loadingBets } = useCompetitionBets(id)
  const roundForHook = typeof filter === 'number' ? filter : null
  const { matches: roundMatches, loading: loadingMatches } = useMatches(roundForHook)

  useEffect(() => {
    const controller = new AbortController()
    api.get(`/competitions/${id}`, { signal: controller.signal })
      .then(({ data }) => setCompetition(data))
      .catch(err => { if (err.name !== 'CanceledError') navigate('/competitions') })
      .finally(() => setLoadingComp(false))
    return () => controller.abort()
  }, [id, navigate])

  const participant = useMemo(() => {
    if (!competition?.participants) return null
    return competition.participants.find(p => p.user_id === userId) || null
  }, [competition, userId])

  const position = useMemo(() => {
    if (!competition?.participants) return null
    const idx = competition.participants.findIndex(p => p.user_id === userId)
    return idx >= 0 ? idx + 1 : null
  }, [competition, userId])

  // Todas as apostas pontuadas do jogador na competição
  const playerBets = useMemo(() => {
    if (!betsData?.matches) return []
    const rows = []
    for (const m of betsData.matches) {
      const b = m.bets?.find(x => x.user_id === userId)
      if (!b) continue
      rows.push({ match_id: m.match_id, ...b })
    }
    return rows
  }, [betsData, userId])

  const allSummary = useMemo(() => summarize(playerBets), [playerBets])

  // Quando filtro = rodada, filtra os bets pelos match_ids da rodada
  const roundMatchIds = useMemo(
    () => new Set(roundMatches.map(m => m.match_id)),
    [roundMatches]
  )
  const filteredBets = useMemo(() => {
    if (filter === 'all') return playerBets
    return playerBets.filter(b => roundMatchIds.has(b.match_id))
  }, [filter, playerBets, roundMatchIds])

  const filteredSummary = useMemo(() => summarize(filteredBets), [filteredBets])

  // Para o modo Geral: agrupar pontos por rodada usando match_id → matchday do cache não está disponível
  // sem fetch. Em vez disso, mostramos lista cronológica de apostas pontuadas (sem detalhe de jogo)
  // ou — no modo rodada — cards completos.
  const matchesById = useMemo(() => {
    const map = new Map()
    for (const m of roundMatches) map.set(m.match_id, m)
    return map
  }, [roundMatches])

  const labelFallback = (raw, key) => {
    const label = raw?.[key]
    if (!label) return null
    return { id: '0', name_en: label, fifa_code: '', flag: null }
  }

  const isMe = user?.id === userId
  const loading = loadingComp || loadingBets

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={`/competitions/${id}`} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-gray-900 truncate">
              {participant?.user_name || 'Participante'}
              {isMe && <span className="text-brand-500 text-xs ml-1">(você)</span>}
            </h1>
            <p className="text-xs text-gray-400 truncate">
              {competition?.name}
              {position && <> · {position}º lugar</>}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-5 text-white">
          <p className="text-xs uppercase tracking-wide text-brand-100 mb-1">
            {filter === 'all' ? 'Pontuação total' : ROUND_LABELS[filter]}
          </p>
          <p className="text-4xl font-bold">{filteredSummary.total} pts</p>
          <p className="text-xs text-brand-100 mt-1">
            {filteredSummary.scored} aposta{filteredSummary.scored === 1 ? '' : 's'} pontuada{filteredSummary.scored === 1 ? '' : 's'}
            {filter === 'all' && participant?.bets_count != null && (
              <> de {participant.bets_count} feita{participant.bets_count === 1 ? '' : 's'}</>
            )}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <StatCard label="Placar exato" value={filteredSummary.exatos} accent="text-emerald-600" />
          <StatCard label="Resultado" value={filteredSummary.resultados} accent="text-blue-600" />
          <StatCard label="Classificado" value={filteredSummary.classificados} accent="text-amber-600" />
          <StatCard label="Errou" value={filteredSummary.erros} accent="text-gray-400" />
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide px-1">
            Filtrar
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                filter === 'all'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
              }`}
            >
              Geral
            </button>
            {ALL_ROUNDS.map(r => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                  filter === r
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
                }`}
              >
                {ROUND_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide px-1">
            Apostas
          </p>

          {filter === 'all' ? (
            playerBets.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8 bg-white rounded-xl border border-gray-100">
                Nenhuma aposta pontuada ainda.
              </p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {playerBets
                  .slice()
                  .sort((a, b) => a.match_id - b.match_id)
                  .map(b => (
                    <div key={b.match_id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 font-medium">Jogo #{b.match_id}</p>
                        <p className="text-[11px] text-gray-400">
                          Apostou {b.predicted_home_score} × {b.predicted_away_score}
                          {b.predicted_classifier && (
                            <> · Classificado: {b.predicted_classifier === 'home' ? 'casa' : 'fora'}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <CategoryBadge points={b.points} />
                        {b.points != null && (
                          <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-semibold">
                            {b.points} pt{b.points === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )
          ) : loadingMatches ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600" />
            </div>
          ) : roundMatches.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8 bg-white rounded-xl border border-gray-100">
              Nenhum jogo nesta rodada.
            </p>
          ) : (
            <div className="grid gap-2">
              {roundMatches
                .slice()
                .sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc))
                .map(m => {
                  const b = playerBets.find(x => x.match_id === m.match_id)
                  const raw = m.data || {}
                  const homeTeam = m.home_team || labelFallback(raw, 'home_team_label')
                  const awayTeam = m.away_team || labelFallback(raw, 'away_team_label')
                  if (!b) {
                    return (
                      <div key={m.match_id} className="bg-white rounded-xl border border-gray-100 p-3 opacity-60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] text-gray-400">{formatDateBRT(m.kickoff_utc)}</span>
                          <span className="text-[11px] text-gray-400">Sem aposta</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 flex justify-center"><TeamFlag team={homeTeam} size="sm" /></div>
                          <div className="text-center px-2 min-w-[60px]">
                            {m.finished ? (
                              <div className="text-base font-bold text-gray-800">
                                {raw.home_score ?? '—'} × {raw.away_score ?? '—'}
                              </div>
                            ) : (
                              <div className="text-gray-300 text-base">vs</div>
                            )}
                          </div>
                          <div className="flex-1 flex justify-center"><TeamFlag team={awayTeam} size="sm" /></div>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <BetRow key={m.match_id} match={m} bet={b} homeTeam={homeTeam} awayTeam={awayTeam} />
                  )
                })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

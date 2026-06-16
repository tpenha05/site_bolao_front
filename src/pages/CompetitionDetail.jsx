import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useMatches } from '../hooks/useMatches'
import { useCompetitionBets } from '../hooks/useBets'
import MatchCard from '../components/MatchCard'
import RankingTable from '../components/RankingTable'
import { copyToClipboard } from '../utils/copyToClipboard'

const STAGE_LABELS = {
  'Group Stage': 'Fase de Grupos',
  'Round of 32': 'Oitavas de Final',
  'Round of 16': 'Oitavas de Final',
  'Quarter-finals': 'Quartas de Final',
  'Semi-finals': 'Semifinais',
  'Third Place': 'Terceiro Lugar',
  'Final': 'Final',
}

// Copa 2026: 9 matchdays (1-3 grupos, 4 R32, 5 R16, 6 QF, 7 SF, 8 3º lugar, 9 Final)
const ALL_ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const ROUND_STAGE_FALLBACK = {
  1: 'Group Stage', 2: 'Group Stage', 3: 'Group Stage',
  4: 'Round of 32', 5: 'Round of 16', 6: 'Quarter-finals',
  7: 'Semi-finals', 8: 'Third Place', 9: 'Final',
}

export default function CompetitionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [competition, setCompetition] = useState(null)
  const [loadingComp, setLoadingComp] = useState(true)
  const [tab, setTab] = useState('bets')
  const [copied, setCopied] = useState(false)
  const [selectedRound, setSelectedRound] = useState(null)
  const [showPast, setShowPast] = useState(false)

  // Define a rodada default = próxima a acontecer (ou em andamento)
  useEffect(() => {
    if (selectedRound !== null) return
    const controller = new AbortController()
    api.get('/matches/current-round', { signal: controller.signal })
      .then(({ data }) => setSelectedRound(data.matchday ?? 1))
      .catch(err => { if (err.name !== 'CanceledError') setSelectedRound(1) })
    return () => controller.abort()
  }, [selectedRound])

  // Busca apenas a rodada selecionada — só dispara quando já temos um round
  const { matches: roundMatches, loading: loadingMatches, error: matchesError } = useMatches(selectedRound)
  const { betsData } = useCompetitionBets(id)

  const sortedMatches = useMemo(() =>
    [...roundMatches].sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc)),
    [roundMatches]
  )

  const pastCount = useMemo(
    () => sortedMatches.filter(m => m.finished).length,
    [sortedMatches]
  )

  const visibleMatches = useMemo(
    () => (showPast ? sortedMatches : sortedMatches.filter(m => !m.finished)),
    [sortedMatches, showPast]
  )

  const currentStage = useMemo(() => {
    const fromMatch = roundMatches[0]?.data?.type
    return fromMatch ?? ROUND_STAGE_FALLBACK[selectedRound] ?? null
  }, [roundMatches, selectedRound])

  useEffect(() => {
    const controller = new AbortController()
    api.get(`/competitions/${id}`, { signal: controller.signal })
      .then(({ data }) => setCompetition(data))
      .catch(err => { if (err.name !== 'CanceledError') navigate('/competitions') })
      .finally(() => setLoadingComp(false))
    return () => controller.abort()
  }, [id, navigate])

  const handleCopyInvite = async () => {
    const link = `${window.location.origin}/join/${competition.invite_code}`
    await copyToClipboard(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getBetForMatch = (matchId) => {
    if (!betsData) return null
    const matchBets = betsData.matches?.find(m => m.match_id === matchId)
    if (!matchBets) return null
    return matchBets.bets?.find(b => b.user_id === user?.id) ?? null
  }

  const getAllBetsForMatch = (matchId) => {
    if (!betsData) return []
    const matchBets = betsData.matches?.find(m => m.match_id === matchId)
    return matchBets?.bets ?? []
  }

  if (loadingComp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/competitions" className="text-gray-400 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 truncate">{competition?.name}</h1>
              {competition?.description && (
                <p className="text-xs text-gray-400 truncate">{competition.description}</p>
              )}
            </div>
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Convite
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        <div className="flex border-b border-gray-100 mt-2 bg-white sticky top-[61px] z-20">
          <button
            onClick={() => setTab('bets')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${tab === 'bets' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Apostas
          </button>
          <button
            onClick={() => setTab('ranking')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${tab === 'ranking' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Ranking
          </button>
        </div>

        <div className="py-4">
          {tab === 'bets' && (
            loadingMatches ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600" />
              </div>
            ) : matchesError ? (
              <div className="text-center py-10">
                <p className="text-red-500 text-sm font-medium">Erro ao carregar os jogos.</p>
                <p className="text-gray-400 text-xs mt-1">Verifique sua conexão e tente novamente.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  {currentStage && STAGE_LABELS[currentStage] && (
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide px-1">
                      {STAGE_LABELS[currentStage]}
                    </p>
                  )}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {ALL_ROUNDS.map(r => (
                      <button
                        key={r}
                        onClick={() => setSelectedRound(r)}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                          selectedRound === r
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Rodada {r}
                      </button>
                    ))}
                  </div>
                </div>

                {pastCount > 0 && (
                  <div className="mb-3 flex justify-center">
                    <button
                      onClick={() => setShowPast(v => !v)}
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors font-medium flex items-center gap-1.5"
                    >
                      <svg className={`w-3.5 h-3.5 transition-transform ${showPast ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {showPast
                        ? `Ocultar jogos passados (${pastCount})`
                        : `Ver jogos passados (${pastCount})`}
                    </button>
                  </div>
                )}

                {visibleMatches.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-10">
                    {pastCount > 0 && !showPast
                      ? 'Todos os jogos desta rodada já passaram.'
                      : 'Nenhum jogo nesta rodada.'}
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {visibleMatches.map(match => (
                      <MatchCard
                        key={match.match_id}
                        match={match}
                        competitionId={id}
                        bet={getBetForMatch(match.match_id)}
                        allBets={getAllBetsForMatch(match.match_id)}
                        currentUserId={user?.id}
                      />
                    ))}
                  </div>
                )}
              </>
            )
          )}

          {tab === 'ranking' && (
            <RankingTable
              participants={competition?.participants}
              totalMatches={104}
              competitionId={id}
            />
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useMatch } from '../hooks/useMatches'
import { useBet } from '../hooks/useBets'
import { formatDateBRT, isMatchStarted } from '../utils/formatDate'
import TeamFlag from '../components/TeamFlag'

export default function Bet() {
  const { id: competitionId, matchId } = useParams()
  const navigate = useNavigate()

  const { match, loading: loadingMatch } = useMatch(matchId)
  const { bet, loading: loadingBet, setBet } = useBet(competitionId, matchId)

  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [classifier, setClassifier] = useState(null) // 'home' | 'away' | null
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (bet) {
      setHomeScore(String(bet.predicted_home_score))
      setAwayScore(String(bet.predicted_away_score))
      setClassifier(bet.predicted_classifier || null)
    }
  }, [bet])

  const started = match ? isMatchStarted(match.kickoff_utc) : false
  const hn = Number(homeScore)
  const an = Number(awayScore)
  const isDraw = homeScore !== '' && awayScore !== '' && hn === an
  const raw = match?.data || {}
  const isKnockout = raw.type && raw.type !== 'group'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (started) return
    setError('')
    setSaving(true)
    try {
      const { data } = await api.post('/bets', {
        competition_id: competitionId,
        match_id: Number(matchId),
        predicted_home_score: hn,
        predicted_away_score: an,
        predicted_classifier: isDraw && isKnockout ? classifier : null,
      })
      setBet(data)
      navigate(`/competitions/${competitionId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar aposta')
    } finally {
      setSaving(false)
    }
  }

  if (loadingMatch || loadingBet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  const labelFallback = (labelKey) => {
    const label = raw[labelKey]
    if (!label) return null
    return { id: '0', name_en: label, fifa_code: '', flag: null }
  }
  const homeTeam = match?.home_team || labelFallback('home_team_label')
  const awayTeam = match?.away_team || labelFallback('away_team_label')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={`/competitions/${competitionId}`} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-gray-900">{bet ? 'Editar aposta' : 'Fazer aposta'}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="text-center mb-5">
            <p className="text-sm text-gray-500">{formatDateBRT(match?.kickoff_utc)}</p>
            {started && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full mt-1 inline-block">
                Jogo já iniciado
              </span>
            )}
          </div>

          <div className="flex items-center justify-around mb-6">
            <div className="flex-1 flex justify-center">
              <TeamFlag team={homeTeam} size="lg" />
            </div>
            <div className="text-2xl font-light text-gray-300 px-4">vs</div>
            <div className="flex-1 flex justify-center">
              <TeamFlag team={awayTeam} size="lg" />
            </div>
          </div>

          {started ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
              <p className="text-amber-700 text-sm font-medium">Apostas encerradas para este jogo.</p>
              <p className="text-amber-600 text-xs mt-1">O jogo já teve início às {formatDateBRT(match?.kickoff_utc)}.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Placar previsto</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 text-center mb-1 truncate">
                      {homeTeam?.name_en || 'Casa'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={homeScore}
                      onChange={e => setHomeScore(e.target.value)}
                      required
                      className="w-full text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-3 focus:outline-none focus:border-brand-400 transition"
                      placeholder="0"
                    />
                  </div>
                  <div className="text-2xl font-light text-gray-300">×</div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 text-center mb-1 truncate">
                      {awayTeam?.name_en || 'Fora'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={awayScore}
                      onChange={e => setAwayScore(e.target.value)}
                      required
                      className="w-full text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-3 focus:outline-none focus:border-brand-400 transition"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {isKnockout && isDraw && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quem se classifica? <span className="text-gray-400 font-normal">(bônus +1 pt se decidido nos pênaltis)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { side: 'home', team: homeTeam, fallback: 'Casa' },
                      { side: 'away', team: awayTeam, fallback: 'Fora' },
                    ].map(({ side, team, fallback }) => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setClassifier(side)}
                        className={`flex items-center justify-center gap-2 border-2 rounded-xl py-2.5 px-3 text-sm font-medium transition ${
                          classifier === side
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {team?.flag && (
                          <img src={team.flag} alt="" className="w-6 h-4 object-cover rounded shadow-sm" />
                        )}
                        <span className="truncate">{team?.name_en || fallback}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Só pontua se o jogo for decidido nos pênaltis. Se acabar no tempo normal ou na prorrogação, esta escolha é ignorada.
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                <p><strong className="text-brand-700">5 pts</strong> — Placar exato</p>
                <p><strong className="text-gray-700">2 pts</strong> — Resultado correto (vitória/empate)</p>
                {isKnockout && (
                  <p><strong className="text-gray-700">+1 pt</strong> — Classificado correto nos pênaltis</p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {saving ? 'Salvando...' : bet ? 'Atualizar aposta' : 'Salvar aposta'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

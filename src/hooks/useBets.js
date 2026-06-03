import { useState, useEffect } from 'react'
import api from '../services/api'

export function useBet(competitionId, matchId) {
  const [bet, setBet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!competitionId || !matchId) return
    const controller = new AbortController()
    api.get('/bets', { params: { competition_id: competitionId, match_id: matchId }, signal: controller.signal })
      .then(({ data }) => setBet(data))
      .catch(() => { if (!controller.signal.aborted) setBet(null) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [competitionId, matchId])

  return { bet, loading, setBet }
}

export function useCompetitionBets(competitionId) {
  const [betsData, setBetsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!competitionId) return
    const controller = new AbortController()
    api.get(`/bets/competition/${competitionId}`, { signal: controller.signal })
      .then(({ data }) => setBetsData(data))
      .catch(() => { if (!controller.signal.aborted) setBetsData(null) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [competitionId])

  return { betsData, loading }
}

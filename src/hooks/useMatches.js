import { useState, useEffect } from 'react'
import api from '../services/api'

export function useMatches(round) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (round === null || round === undefined) {
      // aguarda definição da rodada antes de buscar — evita pedir 104 jogos
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    api.get('/matches', { params: { round }, signal: controller.signal })
      .then(({ data }) => setMatches(data))
      .catch(err => { if (!controller.signal.aborted) setError(err) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [round])

  return { matches, loading, error }
}

export function useMatch(matchId) {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!matchId) return
    const controller = new AbortController()
    setLoading(true)
    api.get(`/matches/${matchId}`, { signal: controller.signal })
      .then(({ data }) => setMatch(data))
      .catch(err => { if (!controller.signal.aborted) setError(err) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [matchId])

  return { match, loading, error }
}

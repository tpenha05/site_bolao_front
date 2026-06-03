import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const CompetitionContext = createContext(null)

export function CompetitionProvider({ children }) {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCompetitions = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/competitions')
      setCompetitions(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCompetition = async (name, description) => {
    const { data } = await api.post('/competitions', { name, description })
    setCompetitions(prev => [...prev, data])
    return data
  }

  const joinCompetition = async (invite_code) => {
    const { data } = await api.post('/competitions/join', { invite_code })
    setCompetitions(prev => [...prev, data])
    return data
  }

  return (
    <CompetitionContext.Provider value={{ competitions, loading, fetchCompetitions, createCompetition, joinCompetition }}>
      {children}
    </CompetitionContext.Provider>
  )
}

export function useCompetition() {
  return useContext(CompetitionContext)
}

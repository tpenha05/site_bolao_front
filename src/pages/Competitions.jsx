import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCompetition } from '../contexts/CompetitionContext'
import Modal from '../components/Modal'

function CompetitionCard({ comp }) {
  return (
    <Link
      to={`/competitions/${comp.id}`}
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-5"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-base leading-tight">{comp.name}</h3>
        {comp.is_admin && (
          <span className="text-xs px-2 py-0.5 bg-gold-400/20 text-gold-600 rounded-full font-medium ml-2 flex-shrink-0">
            Admin
          </span>
        )}
      </div>
      {comp.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{comp.description}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
        <span>Código: <strong className="text-gray-600">{comp.invite_code}</strong></span>
      </div>
    </Link>
  )
}

export default function Competitions() {
  const { user, logout } = useAuth()
  const { competitions, loading, fetchCompetitions, createCompetition, joinCompetition } = useCompetition()
  const navigate = useNavigate()

  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCompetitions()
  }, [fetchCompetitions])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const comp = await createCompetition(createForm.name, createForm.description || undefined)
      setShowCreate(false)
      setCreateForm({ name: '', description: '' })
      navigate(`/competitions/${comp.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar competição')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const comp = await joinCompetition(joinCode.trim().toUpperCase())
      setShowJoin(false)
      setJoinCode('')
      navigate(`/competitions/${comp.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Código inválido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-gray-900 text-sm">Bolão Copa 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Minhas competições</h1>
            <p className="text-sm text-gray-500 mt-0.5">Olá, {user?.name}!</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setError(''); setShowJoin(true) }}
              className="text-sm px-3 py-2 border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 transition-colors font-medium"
            >
              Entrar
            </button>
            <button
              onClick={() => { setError(''); setShowCreate(true) }}
              className="text-sm px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              + Criar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-gray-500 text-sm">Você ainda não participa de nenhuma competição.</p>
            <p className="text-gray-400 text-xs mt-1">Crie uma ou entre com um código de convite.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {competitions.map(comp => (
              <CompetitionCard key={comp.id} comp={comp} />
            ))}
          </div>
        )}
      </main>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova competição">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              value={createForm.name}
              onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
              placeholder="Ex: Bolão do Trabalho"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
            <textarea
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition resize-none"
              placeholder="Uma descrição breve..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Entrar em competição">
        <form onSubmit={handleJoin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de convite</label>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              required
              maxLength={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 transition tracking-widest"
              placeholder="XXXXXXXX"
            />
            <p className="text-xs text-gray-400 mt-1">Peça o código para o administrador da competição.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowJoin(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

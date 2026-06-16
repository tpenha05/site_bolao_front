import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

function Medal({ position }) {
  if (position === 1) return <span className="text-gold-500 text-lg">🥇</span>
  if (position === 2) return <span className="text-gray-400 text-lg">🥈</span>
  if (position === 3) return <span className="text-amber-600 text-lg">🥉</span>
  return <span className="text-gray-400 text-sm font-medium w-7 text-center">{position}º</span>
}

export default function RankingTable({ participants, totalMatches, competitionId }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!participants || participants.length === 0) {
    return <p className="text-center text-gray-400 py-8">Nenhum participante ainda.</p>
  }

  const linkable = Boolean(competitionId)

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3 text-left w-10">#</th>
            <th className="px-4 py-3 text-left">Participante</th>
            <th className="px-4 py-3 text-right">Apostas</th>
            <th className="px-4 py-3 text-right">Pontos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {participants.map((p, i) => {
            const isMe = user && p.user_id === user.id
            const baseCls = `transition-colors ${isMe ? 'bg-brand-50 border-l-4 border-l-brand-500' : 'hover:bg-gray-50'} ${linkable ? 'cursor-pointer' : ''}`

            const cells = (
              <>
                <td className="px-4 py-3">
                  <Medal position={i + 1} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.user_name} />
                    <span className={`text-sm font-medium ${isMe ? 'text-brand-700' : 'text-gray-800'}`}>
                      {p.user_name} {isMe && <span className="text-brand-500 text-xs">(você)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-500">
                    {p.bets_count}
                    {totalMatches != null && <span className="text-gray-300">/{totalMatches}</span>}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-bold ${isMe ? 'text-brand-700' : 'text-gray-800'}`}>
                    {p.total_points} pts
                  </span>
                </td>
              </>
            )

            if (!linkable) {
              return <tr key={p.user_id} className={baseCls}>{cells}</tr>
            }

            return (
              <tr
                key={p.user_id}
                className={baseCls}
                onClick={() => navigate(`/competitions/${competitionId}/players/${p.user_id}`)}
              >
                {cells}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

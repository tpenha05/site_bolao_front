import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CompetitionProvider } from './contexts/CompetitionContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Competitions from './pages/Competitions'
import CompetitionDetail from './pages/CompetitionDetail'
import Bet from './pages/Bet'
import Ranking from './pages/Ranking'

export default function App() {
  return (
    <AuthProvider>
      <CompetitionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/competitions"
              element={<ProtectedRoute><Competitions /></ProtectedRoute>}
            />
            <Route
              path="/competitions/:id"
              element={<ProtectedRoute><CompetitionDetail /></ProtectedRoute>}
            />
            <Route
              path="/competitions/:id/bet/:matchId"
              element={<ProtectedRoute><Bet /></ProtectedRoute>}
            />
            <Route
              path="/competitions/:id/ranking"
              element={<ProtectedRoute><Ranking /></ProtectedRoute>}
            />
            <Route path="/" element={<Navigate to="/competitions" replace />} />
            <Route path="*" element={<Navigate to="/competitions" replace />} />
          </Routes>
        </BrowserRouter>
      </CompetitionProvider>
    </AuthProvider>
  )
}

// Cálculo client-side de pontos — deve espelhar app/services/scoring_service.py.
// `result` = raw_data do jogo (com home_score, away_score, home_penalty_score, away_penalty_score).
export function calcPoints(bet, result) {
  if (!result || bet.predicted_home_score == null || bet.predicted_away_score == null) return null

  const home = Number(result.home_score)
  const away = Number(result.away_score)
  if (Number.isNaN(home) || Number.isNaN(away)) return null

  const { predicted_home_score: ph, predicted_away_score: pa, predicted_classifier } = bet

  const predictedResult = ph > pa ? 'home' : ph < pa ? 'away' : 'draw'
  const actualResult = home > away ? 'home' : home < away ? 'away' : 'draw'

  let pts
  if (ph === home && pa === away) pts = 5
  else if (predictedResult === actualResult) pts = 2
  else pts = 0

  // Pênaltis: placar empatado e placar de pênaltis distinto na API.
  const hp = Number(result.home_penalty_score)
  const ap = Number(result.away_penalty_score)
  const isShootout =
    home === away && !Number.isNaN(hp) && !Number.isNaN(ap) && hp !== ap
  if (isShootout) {
    const shootoutWinner = hp > ap ? 'home' : 'away'
    if (predictedResult === 'draw') {
      if (predicted_classifier === shootoutWinner) pts += 1
    } else if (predictedResult === shootoutWinner) {
      pts += 1
    }
  }
  return pts
}

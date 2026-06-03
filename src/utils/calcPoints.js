export function calcPoints(bet, result) {
  if (!result || bet.predicted_home_score == null || bet.predicted_away_score == null) return null

  const { home_score, away_score } = result
  const { predicted_home_score: ph, predicted_away_score: pa, predicted_top_scorer } = bet

  const exactScore = ph === home_score && pa === away_score
  if (exactScore) {
    return 5 + (predicted_top_scorer ? 1 : 0)
  }

  const correctResult =
    (ph > pa && home_score > away_score) ||
    (ph < pa && home_score < away_score) ||
    (ph === pa && home_score === away_score)

  if (correctResult) {
    return 2 + (predicted_top_scorer ? 1 : 0)
  }

  return 0
}

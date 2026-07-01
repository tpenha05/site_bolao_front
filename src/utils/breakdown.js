// Categorias derivadas dos pontos:
//   6 = placar exato + classificado (empate + acertou vencedor dos pênaltis)
//   5 = só placar exato
//   3 = só resultado + classificado (empate previsto + acertou pênaltis)
//   2 = só resultado
//   1 = só classificado (previu vitória do time que classificou nos pênaltis)
//   0 = errou tudo
export function categorize(points) {
  if (points === 6) return { exato: true, resultado: false, classificado: true, erro: false }
  if (points === 5) return { exato: true, resultado: false, classificado: false, erro: false }
  if (points === 3) return { exato: false, resultado: true, classificado: true, erro: false }
  if (points === 2) return { exato: false, resultado: true, classificado: false, erro: false }
  if (points === 1) return { exato: false, resultado: false, classificado: true, erro: false }
  if (points === 0) return { exato: false, resultado: false, classificado: false, erro: true }
  return null
}

export function summarize(bets) {
  const acc = { total: 0, exatos: 0, resultados: 0, classificados: 0, erros: 0, scored: 0 }
  for (const bet of bets) {
    if (bet.points == null) continue
    acc.total += bet.points
    acc.scored += 1
    const cat = categorize(bet.points)
    if (!cat) continue
    if (cat.exato) acc.exatos += 1
    if (cat.resultado) acc.resultados += 1
    if (cat.classificado) acc.classificados += 1
    if (cat.erro) acc.erros += 1
  }
  return acc
}

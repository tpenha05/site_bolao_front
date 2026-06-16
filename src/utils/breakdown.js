// Categorias derivadas dos pontos:
//   6 = placar exato + artilheiro
//   5 = só placar exato
//   3 = só resultado + artilheiro
//   2 = só resultado
//   1 = só artilheiro
//   0 = errou tudo
export function categorize(points) {
  if (points === 6) return { exato: true, resultado: false, artilheiro: true, erro: false }
  if (points === 5) return { exato: true, resultado: false, artilheiro: false, erro: false }
  if (points === 3) return { exato: false, resultado: true, artilheiro: true, erro: false }
  if (points === 2) return { exato: false, resultado: true, artilheiro: false, erro: false }
  if (points === 1) return { exato: false, resultado: false, artilheiro: true, erro: false }
  if (points === 0) return { exato: false, resultado: false, artilheiro: false, erro: true }
  return null
}

export function summarize(bets) {
  const acc = { total: 0, exatos: 0, resultados: 0, artilheiros: 0, erros: 0, scored: 0 }
  for (const bet of bets) {
    if (bet.points == null) continue
    acc.total += bet.points
    acc.scored += 1
    const cat = categorize(bet.points)
    if (!cat) continue
    if (cat.exato) acc.exatos += 1
    if (cat.resultado) acc.resultados += 1
    if (cat.artilheiro) acc.artilheiros += 1
    if (cat.erro) acc.erros += 1
  }
  return acc
}

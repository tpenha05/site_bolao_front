# Bolão da Copa 2026 — Frontend

Interface web do bolão da Copa do Mundo 2026. Usuários se cadastram, criam ou entram em competições, fazem apostas nos jogos e acompanham o ranking.

## Stack

- **Framework:** React + Vite
- **Estilização:** Tailwind CSS
- **Roteamento:** React Router v6
- **HTTP:** Axios com interceptor JWT em `src/services/api.js`
- **Estado global:** Context API (AuthContext, CompetitionContext)
- **Deploy:** Vercel
- **Backend:** `../site_bolao_back` — FastAPI + PostgreSQL

## Comandos principais

```bash
npm run dev       # servidor local em localhost:5173
npm run build     # build de produção
npm run preview   # prévia do build
```

## Estrutura

```
src/
├── components/    # MatchCard, TeamFlag, RankingTable, Modal, ProtectedRoute
├── pages/         # Login, Register, Competitions, CompetitionDetail, Bet
├── contexts/      # AuthContext, CompetitionContext
├── hooks/         # useAuth, useBets, useMatches
├── services/      # api.js — Axios configurado com interceptor JWT
└── utils/         # formatDate (→ UTC-3), calcPoints, copyToClipboard
```

## Rotas do app

| Rota | Página |
|---|---|
| `/login` | Login |
| `/register` | Cadastro |
| `/competitions` | Lista de competições |
| `/competitions/:id` | Detalhe + abas Apostas / Ranking |
| `/competitions/:id/bet/:matchId` | Tela de aposta |
| `/competitions/:id/ranking` | Ranking direto |

Todas as rotas exceto `/login` e `/register` são protegidas por `ProtectedRoute`.

## Regras de negócio críticas

- Exibir horários sempre em **horário de Brasília (UTC-3)**
- Botão de apostar **desabilitado** se `kickoff_utc` já passou — mostrar mensagem clara
- Apostas dos outros participantes só aparecem após início do jogo — tratar dados ausentes sem quebrar a UI
- Link de convite: `{window.location.origin}/join/{codigo}`

## Design

- Moderno e minimalista, português apenas
- Responsivo: mobile e desktop igualmente (breakpoints Tailwind: `sm`, `md`, `lg`)
- Sem dark mode no MVP

## Variáveis de ambiente

```
VITE_API_URL=http://localhost:8000
```

## Backend — referência rápida

Swagger disponível em `http://localhost:8000/docs`.
Schema completo e regras de negócio em `../site_bolao_back/CLAUDE.md`.

Rotas principais consumidas pelo frontend:
`POST /auth/register` · `POST /auth/login` · `GET /auth/me`
`GET/POST /competitions` · `GET /competitions/:id` · `POST /competitions/:id/invite` · `POST /competitions/join`
`GET /matches?round=N` · `GET /matches/:id`
`POST /bets` · `GET /bets?competition_id=X&match_id=Y` · `GET /bets/competition/:id`

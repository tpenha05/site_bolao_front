# Prompt para Claude Code — Frontend Bolão da Copa

## Contexto do projeto

Este é o **frontend** do aplicativo de bolão para a Copa do Mundo 2026. O backend já está desenvolvido em Python + FastAPI e está na pasta `../site_bolao_back`. Consulte o `CLAUDE.md` e a documentação do backend antes de começar para entender as rotas disponíveis, schemas de resposta e regras de negócio.

---

## Stack

- **Framework:** React com Vite
- **Linguagem:** JavaScript (ou TypeScript se preferir)
- **Estilização:** Tailwind CSS
- **Roteamento:** React Router v6
- **Requisições HTTP:** Axios (com interceptor para injetar o JWT automaticamente)
- **Gerenciamento de estado:** Context API + hooks (sem Redux por enquanto)
- **Deploy:** Vercel

---

## Estrutura do projeto

```
site_bolao_front/
├── src/
│   ├── components/        # componentes reutilizáveis
│   ├── pages/             # uma pasta por página
│   ├── contexts/          # AuthContext, CompetitionContext
│   ├── hooks/             # hooks customizados (useAuth, useBets, etc)
│   ├── services/          # api.js — instância do Axios configurada
│   ├── utils/             # helpers (formatação de data, cálculo de pontos, etc)
│   └── App.jsx
├── public/
├── .env.example
├── CLAUDE.md
├── vercel.json
└── README.md
```

---

## Telas do MVP

### 1. Autenticação

**`/register`** — Cadastro
- Campos: nome, e-mail, senha, confirmação de senha
- Após cadastro bem-sucedido, redireciona para `/competitions`

**`/login`** — Login
- Campos: e-mail e senha
- Salva o JWT no `localStorage`
- Redireciona para `/competitions` se já estiver logado

---

### 2. Competições

**`/competitions`** — Lista de competições
- Lista as competições do usuário (criadas e em que participa)
- Botão para criar nova competição (abre modal com nome e descrição opcional)
- Botão para entrar em uma competição via código de convite (abre modal com campo de código)
- Card de cada competição mostra: nome, número de participantes, posição atual do usuário no ranking

**`/competitions/:id`** — Detalhe da competição
- Header com nome da competição e botão para copiar o link/código de convite
- Abas: **Apostas** | **Ranking**
- Aba Apostas: lista os jogos organizados por rodada (`matchday`), com o status da aposta de cada jogo
- Aba Ranking: tabela com posição, nome do participante e pontuação total

---

### 3. Apostas

**`/competitions/:id/bet/:matchId`** — Tela de aposta de um jogo
- Exibe os times (bandeira + nome), data e horário do jogo (converter para horário de Brasília — UTC-3)
- Campos para inserir o placar previsto (home e away)
- Campo opcional para artilheiro do jogo (texto livre)
- Botão de salvar — desabilitado e com aviso se o jogo já começou
- Se já existe uma aposta salva, exibir os valores atuais nos campos
- Após salvar, volta para `/competitions/:id`

---

### 4. Ranking

Já está incorporado como aba na tela `/competitions/:id`, mas deve ser acessível também via URL direta `/competitions/:id/ranking`.

- Tabela com: posição, avatar com iniciais do nome, nome, pontos totais
- Destacar a linha do usuário logado
- Mostrar quantos jogos cada participante apostou vs total de jogos

---

## Componentes reutilizáveis essenciais

- **`MatchCard`** — card de um jogo com times, placar, status (aberto/encerrado/ao vivo) e status da aposta do usuário
- **`TeamFlag`** — bandeira + nome do time (usar código FIFA para buscar a flag da API do backend)
- **`RankingTable`** — tabela de ranking reutilizável
- **`ProtectedRoute`** — wrapper de rota que redireciona para `/login` se não houver JWT válido
- **`Modal`** — modal genérico para criar competição e entrar via código

---

## Integração com o backend

A URL base da API vem de variável de ambiente `VITE_API_URL`.

Criar `src/services/api.js` com uma instância do Axios que:
- Injeta automaticamente o header `Authorization: Bearer {token}` em todas as requisições
- Em caso de resposta 401, limpa o token do localStorage e redireciona para `/login`

```javascript
// exemplo
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
```

---

## Regras de negócio no frontend

- Horários dos jogos devem ser exibidos sempre em **horário de Brasília (UTC-3)**
- O botão de apostar deve ser desabilitado e mostrar uma mensagem clara se `kickoff_utc` já passou
- As apostas dos outros participantes só ficam visíveis após o início do jogo (o backend já controla isso, mas o frontend deve tratar o caso de dados ausentes graciosamente)
- O código de convite deve ter um botão de **copiar link** que monta a URL completa `{origem}/join/{codigo}`

---

## Design

- **Estilo:** moderno e minimalista
- **Idioma:** português apenas
- **Responsividade:** mobile e desktop igualmente — usar breakpoints do Tailwind (`sm`, `md`, `lg`)
- **Paleta:** livre, mas coerente — sugestão: tons de verde/amarelo sutis remetendo ao Brasil sem ser caricato
- **Tipografia:** sem fontes externas por enquanto, usar a stack padrão do Tailwind (`font-sans`)
- **Sem dark mode** no MVP

---

## Variáveis de ambiente

```
VITE_API_URL=http://localhost:8000   # em produção: URL do backend no Vercel
```

---

## Contexto do backend (referência rápida)

Principais rotas que o frontend vai consumir:

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastro |
| POST | `/auth/login` | Login → retorna JWT |
| GET | `/auth/me` | Dados do usuário logado |
| GET | `/competitions` | Lista competições do usuário |
| POST | `/competitions` | Cria competição |
| GET | `/competitions/:id` | Detalhe + ranking |
| POST | `/competitions/:id/invite` | Gera código de convite |
| POST | `/competitions/join` | Entra via código |
| GET | `/matches?round=N` | Jogos por rodada |
| GET | `/matches/:id` | Detalhe de um jogo |
| POST | `/bets` | Cria ou atualiza aposta |
| GET | `/bets?competition_id=X&match_id=Y` | Aposta do usuário |
| GET | `/bets/competition/:id` | Todas as apostas da competição |

Para o schema completo de cada resposta, consulte `../site_bolao_back/` ou o Swagger em `http://localhost:8000/docs`.

---

## O que não fazer agora

- Não implementar notificações push ou e-mail
- Não adicionar internacionalização (i18n)
- Não implementar dark mode
- Não fazer deploy — apenas ambiente local com `npm run dev`

---

## Entregável esperado

Projeto rodando com `npm run dev` em `http://localhost:5173`, com todas as 4 telas do MVP funcionais e integradas ao backend local.

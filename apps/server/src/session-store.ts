import {
  BOARD,
  MIDLINE_ROW,
  applyGameAction,
  createTurnState,
  isInBounds,
  queueTurnAction,
  type GameAction,
  type GameActionError,
  type GameState,
  type OffsetCoord,
  type Player,
  type Team,
  type TeamSide,
  type TurnState,
} from '@vibe-kick/game-core'

const PLAYERS_PER_TEAM = 4
const TOP_START_ROW = 4
const BOTTOM_START_ROW = 10

type Session = {
  id: string
  gameState: GameState
  turnState: TurnState | null
  ballPlacedByTeamId?: string
  subscribers: Set<ReadableStreamDefaultController<Uint8Array>>
}

export type SessionView = {
  id: string
  gameState: GameState
  turnState: TurnState | null
  ballPlacedByTeamId?: string
}

export type SessionErrorCode =
  | 'session_not_found'
  | 'session_full'
  | 'team_not_found'
  | 'players_invalid'
  | 'ball_invalid'
  | 'turn_not_ready'
  | 'no_actions_remaining'
  | 'action_invalid'

export type SessionError = {
  code: SessionErrorCode
  message: string
  actionError?: GameActionError
}

export type SessionResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: SessionError }

const sessions = new Map<string, Session>()
const encoder = new TextEncoder()

function createTeam(name: string, side: TeamSide): Team {
  return {
    id: crypto.randomUUID(),
    name,
    side,
    players: [],
  }
}

function createBaseGameState(team: Team): GameState {
  return {
    teams: [team],
    ball: {
      position: {
        col: Math.floor(BOARD.columns / 2),
        row: MIDLINE_ROW,
      },
    },
    activeTeamId: team.id,
    round: 1,
  }
}

function serializeSession(session: Session): SessionView {
  return {
    id: session.id,
    gameState: session.gameState,
    turnState: session.turnState,
    ballPlacedByTeamId: session.ballPlacedByTeamId,
  }
}

function formatSse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function broadcast(session: Session, event: string, payload: unknown) {
  if (session.subscribers.size === 0) {
    return
  }
  const message = encoder.encode(formatSse(event, payload))
  for (const controller of session.subscribers) {
    controller.enqueue(message)
  }
}

function updateSession(session: Session) {
  sessions.set(session.id, session)
  broadcast(session, 'state', serializeSession(session))
}

function coordKey(coord: OffsetCoord) {
  return `${coord.col}:${coord.row}`
}

function getTeam(gameState: GameState, teamId: string) {
  return gameState.teams.find((team) => team.id === teamId)
}

function getOtherTeam(gameState: GameState, teamId: string) {
  return gameState.teams.find((team) => team.id !== teamId)
}

function getAllPlayerPositions(teams: Team[]) {
  const occupied = new Set<string>()
  for (const team of teams) {
    for (const player of team.players) {
      occupied.add(coordKey(player.position))
    }
  }
  return occupied
}

export function clearSessionsForTests() {
  sessions.clear()
}

export function createSession(
  teamName: string,
  side: TeamSide = 'top',
): SessionResult<{ session: SessionView; teamId: string }> {
  const team = createTeam(teamName, side)
  const session: Session = {
    id: crypto.randomUUID(),
    gameState: createBaseGameState(team),
    turnState: null,
    subscribers: new Set(),
  }
  sessions.set(session.id, session)
  return { ok: true, value: { session: serializeSession(session), teamId: team.id } }
}

export function joinSession(
  sessionId: string,
  teamName: string,
): SessionResult<{ session: SessionView; teamId: string }> {
  const session = sessions.get(sessionId)
  if (!session) {
    return { ok: false, error: { code: 'session_not_found', message: 'Session not found.' } }
  }

  if (session.gameState.teams.length >= 2) {
    return { ok: false, error: { code: 'session_full', message: 'Session already has two teams.' } }
  }

  const existingTeam = session.gameState.teams[0]
  const side: TeamSide = existingTeam.side === 'top' ? 'bottom' : 'top'
  const newTeam = createTeam(teamName, side)
  const updatedSession: Session = {
    ...session,
    gameState: {
      ...session.gameState,
      teams: [...session.gameState.teams, newTeam],
    },
  }

  updateSession(updatedSession)
  return { ok: true, value: { session: serializeSession(updatedSession), teamId: newTeam.id } }
}

export function placePlayers(
  sessionId: string,
  teamId: string,
  players: Player[],
): SessionResult<SessionView> {
  const session = sessions.get(sessionId)
  if (!session) {
    return { ok: false, error: { code: 'session_not_found', message: 'Session not found.' } }
  }

  const team = getTeam(session.gameState, teamId)
  if (!team) {
    return { ok: false, error: { code: 'team_not_found', message: 'Team not found.' } }
  }

  if (players.length !== PLAYERS_PER_TEAM) {
    return {
      ok: false,
      error: {
        code: 'players_invalid',
        message: `Exactly ${PLAYERS_PER_TEAM} players are required.`,
      },
    }
  }

  const playerIds = new Set(players.map((player) => player.id))
  if (playerIds.size !== players.length) {
    return {
      ok: false,
      error: { code: 'players_invalid', message: 'Player ids must be unique.' },
    }
  }

  const requiredRow = team.side === 'top' ? TOP_START_ROW : BOTTOM_START_ROW
  const occupied = getAllPlayerPositions(session.gameState.teams)
  const incomingPositions = new Set<string>()

  for (const player of players) {
    if (!isInBounds(player.position)) {
      return {
        ok: false,
        error: { code: 'players_invalid', message: 'Player positions must be in bounds.' },
      }
    }
    if (player.position.row !== requiredRow) {
      return {
        ok: false,
        error: {
          code: 'players_invalid',
          message: `Players must be placed on row ${requiredRow}.`,
        },
      }
    }
    const key = coordKey(player.position)
    if (incomingPositions.has(key)) {
      return {
        ok: false,
        error: { code: 'players_invalid', message: 'Player positions must be unique.' },
      }
    }
    if (occupied.has(key)) {
      return {
        ok: false,
        error: { code: 'players_invalid', message: 'Player positions overlap another team.' },
      }
    }
    incomingPositions.add(key)
  }

  const updatedTeams = session.gameState.teams.map((current) =>
    current.id === team.id ? { ...current, players } : current,
  )

  const updatedSession: Session = {
    ...session,
    gameState: {
      ...session.gameState,
      teams: updatedTeams,
    },
  }

  updateSession(updatedSession)
  return { ok: true, value: serializeSession(updatedSession) }
}

export function placeBall(
  sessionId: string,
  teamId: string,
  position: OffsetCoord,
): SessionResult<SessionView> {
  const session = sessions.get(sessionId)
  if (!session) {
    return { ok: false, error: { code: 'session_not_found', message: 'Session not found.' } }
  }

  if (session.gameState.teams.length < 2) {
    return {
      ok: false,
      error: { code: 'ball_invalid', message: 'Both teams must join before placing the ball.' },
    }
  }

  const team = getTeam(session.gameState, teamId)
  if (!team) {
    return { ok: false, error: { code: 'team_not_found', message: 'Team not found.' } }
  }

  if (!isInBounds(position) || position.row !== MIDLINE_ROW) {
    return {
      ok: false,
      error: { code: 'ball_invalid', message: 'Ball must be placed on the midline in bounds.' },
    }
  }

  const occupied = getAllPlayerPositions(session.gameState.teams)
  if (occupied.has(coordKey(position))) {
    return {
      ok: false,
      error: { code: 'ball_invalid', message: 'Ball cannot be placed on a player.' },
    }
  }

  const otherTeam = getOtherTeam(session.gameState, team.id)
  if (!otherTeam) {
    return { ok: false, error: { code: 'ball_invalid', message: 'Missing opponent team.' } }
  }

  const nextTurnState = createTurnState([team.id, otherTeam.id], otherTeam.id, 1)
  const updatedSession: Session = {
    ...session,
    ballPlacedByTeamId: team.id,
    gameState: {
      ...session.gameState,
      ball: { position },
      activeTeamId: otherTeam.id,
      round: 1,
    },
    turnState: nextTurnState,
  }

  updateSession(updatedSession)
  return { ok: true, value: serializeSession(updatedSession) }
}

export function submitAction(
  sessionId: string,
  action: GameAction,
): SessionResult<SessionView> {
  const session = sessions.get(sessionId)
  if (!session) {
    return { ok: false, error: { code: 'session_not_found', message: 'Session not found.' } }
  }

  if (!session.turnState) {
    return {
      ok: false,
      error: { code: 'turn_not_ready', message: 'Turn order is not ready yet.' },
    }
  }

  if (session.turnState.actionsRemaining <= 0) {
    return {
      ok: false,
      error: { code: 'no_actions_remaining', message: 'No actions remaining this turn.' },
    }
  }

  const actionResult = applyGameAction(session.gameState, action)
  if (!actionResult.ok) {
    return {
      ok: false,
      error: { code: 'action_invalid', message: actionResult.error.message, actionError: actionResult.error },
    }
  }

  const queueResult = queueTurnAction(session.turnState, {
    type: action.type,
    teamId: action.teamId,
    payload: { ...action },
  })
  if (!queueResult.ok) {
    return {
      ok: false,
      error: { code: 'action_invalid', message: 'Turn action rejected.' },
    }
  }

  const updatedSession: Session = {
    ...session,
    gameState: {
      ...actionResult.state,
      activeTeamId: queueResult.state.activeTeamId,
      round: queueResult.state.round,
    },
    turnState: queueResult.state,
  }

  updateSession(updatedSession)
  return { ok: true, value: serializeSession(updatedSession) }
}

export function getSession(sessionId: string): SessionResult<SessionView> {
  const session = sessions.get(sessionId)
  if (!session) {
    return { ok: false, error: { code: 'session_not_found', message: 'Session not found.' } }
  }
  return { ok: true, value: serializeSession(session) }
}

export function subscribeToSession(sessionId: string) {
  const session = sessions.get(sessionId)
  if (!session) {
    return null
  }

  let streamController: ReadableStreamDefaultController<Uint8Array> | null = null
  return new ReadableStream<Uint8Array>({
    start(controller) {
      streamController = controller
      session.subscribers.add(controller)
      controller.enqueue(encoder.encode(formatSse('state', serializeSession(session))))
    },
    cancel() {
      if (streamController) {
        session.subscribers.delete(streamController)
      }
    },
  })
}

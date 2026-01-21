import {
  createSession,
  getSession,
  joinSession,
  placeBall,
  placePlayers,
  submitAction,
  subscribeToSession,
  type SessionError,
} from './session-store'

const port = Number(process.env.PORT ?? '3000')

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function errorResponse(status: number, error: SessionError) {
  return jsonResponse(status, { ok: false, error })
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

function getPathParts(pathname: string) {
  return pathname.split('/').filter(Boolean)
}

Bun.serve({
  port,
  fetch: async (request) => {
    const url = new URL(request.url)
    const parts = getPathParts(url.pathname)

    if (request.method === 'POST' && url.pathname === '/sessions') {
      const body = await readJson<{ teamName?: string; side?: 'top' | 'bottom' }>(request)
      if (!body?.teamName) {
        return jsonResponse(400, { ok: false, error: { code: 'players_invalid', message: 'teamName is required.' } })
      }
      const result = createSession(body.teamName, body.side)
      return jsonResponse(200, { ok: true, ...result.value })
    }

    if (parts[0] === 'sessions' && parts.length >= 2) {
      const sessionId = parts[1]

      if (request.method === 'GET' && parts.length === 2) {
        const result = getSession(sessionId)
        if (!result.ok) {
          return errorResponse(404, result.error)
        }
        return jsonResponse(200, { ok: true, session: result.value })
      }

      if (request.method === 'GET' && parts.length === 3 && parts[2] === 'events') {
        const stream = subscribeToSession(sessionId)
        if (!stream) {
          return errorResponse(404, { code: 'session_not_found', message: 'Session not found.' })
        }
        return new Response(stream, {
          headers: {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
          },
        })
      }

      if (request.method === 'POST' && parts.length === 3 && parts[2] === 'join') {
        const body = await readJson<{ teamName?: string }>(request)
        if (!body?.teamName) {
          return jsonResponse(400, { ok: false, error: { code: 'players_invalid', message: 'teamName is required.' } })
        }
        const result = joinSession(sessionId, body.teamName)
        if (!result.ok) {
          return errorResponse(400, result.error)
        }
        return jsonResponse(200, { ok: true, ...result.value })
      }

      if (request.method === 'POST' && parts.length === 5 && parts[2] === 'teams' && parts[4] === 'players') {
        const teamId = parts[3]
        const body = await readJson<{ players?: unknown }>(request)
        if (!body?.players || !Array.isArray(body.players)) {
          return jsonResponse(400, { ok: false, error: { code: 'players_invalid', message: 'players array is required.' } })
        }
        const result = placePlayers(sessionId, teamId, body.players)
        if (!result.ok) {
          return errorResponse(400, result.error)
        }
        return jsonResponse(200, { ok: true, session: result.value })
      }

      if (request.method === 'POST' && parts.length === 3 && parts[2] === 'ball') {
        const body = await readJson<{ teamId?: string; position?: { col: number; row: number } }>(request)
        if (!body?.teamId || !body.position) {
          return jsonResponse(400, { ok: false, error: { code: 'ball_invalid', message: 'teamId and position are required.' } })
        }
        const result = placeBall(sessionId, body.teamId, body.position)
        if (!result.ok) {
          return errorResponse(400, result.error)
        }
        return jsonResponse(200, { ok: true, session: result.value })
      }

      if (request.method === 'POST' && parts.length === 3 && parts[2] === 'actions') {
        const body = await readJson<{ action?: unknown }>(request)
        if (!body?.action) {
          return jsonResponse(400, { ok: false, error: { code: 'action_invalid', message: 'action is required.' } })
        }
        const result = submitAction(sessionId, body.action as never)
        if (!result.ok) {
          return errorResponse(400, result.error)
        }
        return jsonResponse(200, { ok: true, session: result.value })
      }
    }

    return new Response('Not found', { status: 404 })
  },
})

console.log(`Server listening on http://localhost:${port}`)

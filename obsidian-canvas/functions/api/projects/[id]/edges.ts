import { type Env, json, error, getUserFromRequest } from '../../types'

// GET /api/projects/:id/edges
export const onRequestGet: PagesFunction<Env> = async ({ params, request, env }) => {
  const user = await getUserFromRequest(request, env)
  if (!user) return error('Not authenticated', 401)
  const projectId = params.id as string
  const { results } = await env.DB.prepare(
    'SELECT id, source, target, type, data FROM edges WHERE project_id = ?'
  ).bind(projectId).all()

  const edges = results.map((row: Record<string, unknown>) => ({
    id: row.id,
    source: row.source,
    target: row.target,
    type: row.type,
    data: JSON.parse(row.data as string),
  }))

  return json(edges)
}

// PUT /api/projects/:id/edges — replace all edges for a project
export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const user = await getUserFromRequest(request, env)
  if (!user) return error('Not authenticated', 401)
  const projectId = params.id as string
  const edges = (await request.json()) as Array<{
    id: string
    source: string
    target: string
    type?: string
    data?: Record<string, unknown>
  }>

  const stmts = [
    env.DB.prepare('DELETE FROM edges WHERE project_id = ?').bind(projectId),
    ...edges.map((e) =>
      env.DB.prepare(
        'INSERT INTO edges (id, project_id, source, target, type, data) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        e.id,
        projectId,
        e.source,
        e.target,
        e.type || 'floating',
        JSON.stringify(e.data || {})
      )
    ),
  ]

  await env.DB.batch(stmts)
  return json({ ok: true })
}

import { type Env, json, error, getUserFromRequest } from '../../types'

// GET /api/projects/:id/nodes
export const onRequestGet: PagesFunction<Env> = async ({ params, request, env }) => {
  const user = await getUserFromRequest(request, env)
  if (!user) return error('Not authenticated', 401)
  const projectId = params.id as string
  const { results } = await env.DB.prepare(
    'SELECT id, type, position_x, position_y, width, height, data FROM nodes WHERE project_id = ?'
  ).bind(projectId).all()

  const nodes = results.map((row: Record<string, unknown>) => {
    const style: Record<string, unknown> = {}
    if (row.width) style.width = row.width
    if (row.height) style.height = row.height
    return {
      id: row.id,
      type: row.type,
      position: { x: row.position_x, y: row.position_y },
      data: JSON.parse(row.data as string),
      ...(Object.keys(style).length ? { style } : {}),
    }
  })

  return json(nodes)
}

// PUT /api/projects/:id/nodes — replace all nodes for a project
export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const user = await getUserFromRequest(request, env)
  if (!user) return error('Not authenticated', 401)
  const projectId = params.id as string
  const nodes = (await request.json()) as Array<{
    id: string
    type?: string
    position: { x: number; y: number }
    data: Record<string, unknown>
    style?: { width?: number; height?: number }
  }>

  const stmts = [
    env.DB.prepare('DELETE FROM nodes WHERE project_id = ?').bind(projectId),
    ...nodes.map((n) =>
      env.DB.prepare(
        'INSERT INTO nodes (id, project_id, type, position_x, position_y, width, height, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        n.id,
        projectId,
        n.type || 'note',
        n.position.x,
        n.position.y,
        n.style?.width ?? null,
        n.style?.height ?? null,
        JSON.stringify(n.data)
      )
    ),
  ]

  await env.DB.batch(stmts)
  return json({ ok: true })
}

import { type Env, json, error, getUserFromRequest } from '../../types'

// PATCH /api/projects/:id — rename a project
export const onRequestPatch: PagesFunction<Env> = async ({ params, request, env }) => {
  const user = await getUserFromRequest(request, env)
  if (!user) return error('Not authenticated', 401)
  const id = params.id as string
  const { name } = (await request.json()) as { name: string }
  if (!name) return error('name required')

  await env.DB.prepare(
    'UPDATE projects SET name = ? WHERE id = ? AND user_id = ?'
  ).bind(name, id, user.id).run()

  return json({ ok: true })
}

// DELETE /api/projects/:id — delete a project and its data
export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  const user = await getUserFromRequest(request, env)
  if (!user) return error('Not authenticated', 401)
  const id = params.id as string

  // Verify ownership
  const project = await env.DB.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first()
  if (!project) return error('Not found', 404)

  await env.DB.batch([
    env.DB.prepare('DELETE FROM nodes WHERE project_id = ?').bind(id),
    env.DB.prepare('DELETE FROM edges WHERE project_id = ?').bind(id),
    env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id),
  ])

  return json({ ok: true })
}

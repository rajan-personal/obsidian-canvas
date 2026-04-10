import { type Env, json, error, getUserFromRequest } from '../types'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUserFromRequest(request, env)
  if (!user) return error('Not authenticated', 401)
  const { results } = await env.DB.prepare(
    'SELECT id, name, created_at as createdAt FROM projects WHERE user_id = ? ORDER BY created_at ASC'
  ).bind(user.id).all()
  return json(results)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUserFromRequest(request, env)
  if (!user) return error('Not authenticated', 401)
  const { id, name } = (await request.json()) as { id: string; name: string }
  if (!id || !name) return error('id and name required')
  await env.DB.prepare(
    'INSERT INTO projects (id, name, user_id) VALUES (?, ?, ?)'
  ).bind(id, name, user.id).run()
  const project = await env.DB.prepare(
    'SELECT id, name, created_at as createdAt FROM projects WHERE id = ?'
  ).bind(id).first()
  return json(project, 201)
}

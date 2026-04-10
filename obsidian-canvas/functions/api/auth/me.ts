import { type Env, json, error, getUserFromRequest } from '../types'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUserFromRequest(request, env)
  if (!user) return error('Not authenticated', 401)
  return json(user)
}

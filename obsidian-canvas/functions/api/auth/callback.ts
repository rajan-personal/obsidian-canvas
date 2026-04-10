import { type Env, signJWT } from '../types'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (!code) return new Response('Missing code', { status: 400 })

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/api/auth/callback`,
      grant_type: 'authorization_code',
    }),
  })
  const tokens = await tokenRes.json() as { access_token?: string }
  if (!tokens.access_token) return new Response('Token exchange failed', { status: 400 })

  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const gUser = await userRes.json() as { id: string; email: string; name: string; picture: string }

  // Upsert user in D1
  await env.DB.prepare(
    'INSERT INTO users (id, email, name, picture) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=?, picture=?'
  ).bind(gUser.id, gUser.email, gUser.name, gUser.picture, gUser.name, gUser.picture).run()

  // Create JWT session cookie
  const jwt = await signJWT({ id: gUser.id, email: gUser.email, name: gUser.name }, env.JWT_SECRET)

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': `session=${jwt}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
    },
  })
}

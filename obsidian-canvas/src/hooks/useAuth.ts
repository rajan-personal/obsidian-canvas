import { useState, useEffect } from 'react'

type User = { id: string; email: string; name: string } | null

export function useAuth() {
  const [user, setUser] = useState<User>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUser(u))
      .finally(() => setChecking(false))
  }, [])

  return { user, checking, login: () => { window.location.href = '/api/auth/google' } }
}

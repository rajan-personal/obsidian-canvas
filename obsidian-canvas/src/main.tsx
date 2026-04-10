import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useAuth } from './hooks/useAuth'

function Root() {
  const { user, checking, login } = useAuth()

  if (checking) return <div className="auth-screen">Loading...</div>

  if (!user) {
    return (
      <div className="auth-screen">
        <button className="auth-btn" onClick={login}>
          Sign in with Google
        </button>
      </div>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)

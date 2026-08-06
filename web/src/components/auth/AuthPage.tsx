import { useState } from 'react'
import { supabase } from '../../services/supabaseClient'

type AuthMode = 'login' | 'register'

export default function AuthPage(): React.ReactElement {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) {
          setError(authError.message)
        }
      } else {
        const { error: authError } = await supabase.auth.signUp({ email, password })
        if (authError) {
          setError(authError.message)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = (): void => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-base)] px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h1 className="font-mono text-3xl font-semibold text-[var(--color-accent)]">
          TITIS
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {mode === 'login' ? 'Masuk' : 'Daftar'}
        </p>

        {error && (
          <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-1 rounded bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Memuat...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleMode}
          className="mt-4 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>
      </div>
    </div>
  )
}

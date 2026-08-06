import useAuth from './hooks/useAuth'
import AuthPage from './components/auth/AuthPage'
import CaptureBar from './components/inbox/CaptureBar'
import InboxList from './components/inbox/InboxList'

function App(): React.ReactElement {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-base)]">
        <p className="font-mono text-sm text-[var(--color-muted)]">Memuat TITIS...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-[var(--color-base)]">
      <div className="mx-auto flex min-h-screen max-w-[640px] flex-col gap-4 px-4 py-6">
        <header className="flex items-center justify-between">
          <h1 className="font-mono text-2xl font-semibold text-[var(--color-accent)]">TITIS</h1>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            Keluar
          </button>
        </header>

        <CaptureBar />
        <InboxList />
      </div>
    </div>
  )
}

export default App

import { useState } from 'react'
import { useInboxStore } from '../../store/useInboxStore'

export default function CaptureBar(): React.ReactElement {
  const [text, setText] = useState('')
  const addItem = useInboxStore((state) => state.addItem)

  const handleSubmit = async (): Promise<void> => {
    const trimmed = text.trim()
    if (!trimmed) return
    await addItem({ type: 'text', content: trimmed })
    setText('')
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void handleSubmit()
        }}
        placeholder="Ketik sesuatu dan tekan Enter..."
        className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
      />
      <button
        type="button"
        onClick={() => void handleSubmit()}
        className="rounded bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
      >
        Simpan
      </button>
    </div>
  )
}
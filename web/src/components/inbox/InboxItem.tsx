import type { InboxItem, ItemType } from '../../types'
import { useInboxStore } from '../../store/useInboxStore'

const TYPE_LABEL: Record<ItemType, string> = {
  text: 'Teks',
  voice: 'Voice',
  image: 'Image',
  youtube: 'YouTube',
}

function download(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function formatTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString('id-ID')
}

export default function InboxItem({ item }: { item: InboxItem }): React.ReactElement {
  const removeItem = useInboxStore((state) => state.removeItem)

  const handleDelete = (): void => {
    void removeItem(item.id)
  }

  const handleExportMd = (): void => {
    download(item.content, `${item.id}.md`, 'text/markdown')
  }

  const handleExportTxt = (): void => {
    download(item.content, `${item.id}.txt`, 'text/plain')
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[var(--color-elevated)] px-2 py-0.5 text-xs text-[var(--color-accent)]">
            {TYPE_LABEL[item.type]}
          </span>
          <span className="text-xs text-[var(--color-muted)]">{formatTime(item.created_at)}</span>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded px-2 py-0.5 text-xs text-[var(--color-muted)] transition-colors hover:bg-[var(--color-elevated)] hover:text-red-400"
        >
          Hapus
        </button>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--color-text)]">{item.content}</p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleExportMd}
          className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          .md
        </button>
        <button
          type="button"
          onClick={handleExportTxt}
          className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          .txt
        </button>
      </div>
    </div>
  )
}
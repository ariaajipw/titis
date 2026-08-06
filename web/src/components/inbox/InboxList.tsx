import { useEffect } from 'react'
import { useInboxStore } from '../../store/useInboxStore'
import InboxItem from './InboxItem'

export default function InboxList(): React.ReactElement {
  const items = useInboxStore((state) => state.items)
  const loading = useInboxStore((state) => state.loading)
  const error = useInboxStore((state) => state.error)
  const fetchItems = useInboxStore((state) => state.fetchItems)

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  if (loading) {
    return <p className="text-sm text-[var(--color-muted)]">Memuat...</p>
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>
  }

  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Inbox kosong. Mulai capture sesuatu.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <InboxItem key={item.id} item={item} />
      ))}
    </div>
  )
}
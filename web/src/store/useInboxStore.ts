import { create } from 'zustand'
import type { InboxItem, CreateItemPayload } from '../types'
import { listItems, createItem, deleteItem } from '../services/api'

interface InboxState {
  items: InboxItem[]
  loading: boolean
  error: string | null
  fetchItems: () => Promise<void>
  addItem: (payload: CreateItemPayload) => Promise<void>
  removeItem: (id: string) => Promise<void>
}

export const useInboxStore = create<InboxState>((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null })
    try {
      const items = await listItems()
      set({ items, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  addItem: async (payload) => {
    const item = await createItem(payload)
    set((state) => ({ items: [item, ...state.items] }))
  },

  removeItem: async (id) => {
    await deleteItem(id)
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
  },
}))

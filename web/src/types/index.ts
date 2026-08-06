export type ItemType = 'text' | 'voice' | 'image' | 'youtube'

export type ItemStatus = 'pending' | 'processing' | 'done' | 'error'

export interface InboxItem {
  id: string
  user_id: string
  type: ItemType
  content: string
  source_url: string | null
  status: ItemStatus
  created_at: string
}

export interface CreateItemPayload {
  type: ItemType
  content: string
  source_url?: string
}

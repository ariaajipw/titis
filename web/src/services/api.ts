import type { CreateItemPayload, InboxItem } from '../types'
import { supabase } from './supabaseClient'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function getAuthHeader(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) {
    throw new Error('Tidak ada sesi aktif')
  }
  return `Bearer ${token}`
}

export async function createItem(payload: CreateItemPayload): Promise<InboxItem> {
  const authorization = await getAuthHeader()
  const res = await fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json() as Promise<InboxItem>
}

export async function listItems(): Promise<InboxItem[]> {
  const authorization = await getAuthHeader()
  const res = await fetch(`${BASE_URL}/items`, {
    method: 'GET',
    headers: {
      Authorization: authorization,
    },
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json() as Promise<InboxItem[]>
}

export async function deleteItem(id: string): Promise<void> {
  const authorization = await getAuthHeader()
  const res = await fetch(`${BASE_URL}/items/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: authorization,
    },
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
}

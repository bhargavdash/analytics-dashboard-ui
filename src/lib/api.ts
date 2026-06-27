import type { ConversationDetail, ConversationMeta } from '@/types'

// Single source of truth for the API base — the stream hook builds on this too.
export const API_BASE = 'http://localhost:8001/api/v1'

export async function listConversations(): Promise<ConversationMeta[]> {
    const res = await fetch(`${API_BASE}/conversations`)
    if (!res.ok) throw new Error(`listConversations failed: ${res.status}`)
    return res.json()
}

export async function getConversation(id: string): Promise<ConversationDetail> {
    const res = await fetch(`${API_BASE}/conversations/${id}`)
    if (!res.ok) throw new Error(`getConversation failed: ${res.status}`)
    return res.json()
}

export async function deleteConversation(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`deleteConversation failed: ${res.status}`)
}

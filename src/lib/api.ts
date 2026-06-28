import type { ConversationDetail, ConversationMeta, Dataset } from '@/types'

// Single source of truth for the API base — the stream hook builds on this too.
// Configurable per environment via VITE_API_BASE_URL (see .env.example); falls back to
// the local dev backend so a fresh clone runs with zero env setup.
export const API_BASE =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001/api/v1'

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

export async function renameConversation(id: string, title: string): Promise<void> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
    })
    if (!res.ok) throw new Error(`renameConversation failed: ${res.status}`)
}

// --- Datasets (Phase B) ---

export async function uploadDataset(file: File): Promise<Dataset> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}/datasets`, { method: 'POST', body: form })
    if (!res.ok) {
        // Surface the server's friendly IngestError detail when present.
        let detail = `Upload failed (${res.status})`
        try {
            const body = await res.json()
            if (body?.detail) detail = body.detail
        } catch { /* non-JSON error body */ }
        throw new Error(detail)
    }
    return res.json()
}

export async function listDatasets(): Promise<Dataset[]> {
    const res = await fetch(`${API_BASE}/datasets`)
    if (!res.ok) throw new Error(`listDatasets failed: ${res.status}`)
    return res.json()
}

export async function deleteDataset(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/datasets/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`deleteDataset failed: ${res.status}`)
}

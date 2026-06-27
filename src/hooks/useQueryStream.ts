import { useDashboardStore } from '@/store/useDashboardStore'
import { useConversations } from '@/hooks/useConversations'
import { API_BASE } from '@/lib/api'
import type { ReasoningStep } from '@/types'

export function useQueryStream() {
    const setStreaming = useDashboardStore((s) => s.setStreaming)
    const setActiveDashboard = useDashboardStore((s) => s.setActiveDashboard)
    const patchActiveDashboard = useDashboardStore((s) => s.patchActiveDashboard)
    const setError = useDashboardStore((s) => s.setError)
    const { refresh } = useConversations()

    // conversationId present => follow-up turn on an existing conversation.
    const submit = async (question: string, conversationId?: string | null) => {
        setStreaming(true)
        setError(null)
        const reasoningSteps: ReasoningStep[] = []

        try {
            const response = await fetch(`${API_BASE}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, conversation_id: conversationId ?? null }),
            })
            if (!response.ok || !response.body) {
                throw new Error(`Query failed: ${response.status}`)
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const chunks = buffer.split('\n\n')
                buffer = chunks.pop() ?? ''

                for (const chunk of chunks) {
                    if (!chunk.trim()) continue

                    let eventType = ''
                    let dataLine = ''
                    for (const line of chunk.split('\n')) {
                        if (line.startsWith('event: ')) eventType = line.slice(7)
                        if (line.startsWith('data: ')) dataLine = line.slice(6)
                    }
                    if (!eventType || !dataLine) continue
                    const payload = JSON.parse(dataLine)

                    if (eventType === 'meta') {
                        // We now know the conversation id — establish the dashboard shell.
                        // For follow-ups this replaces the view with the new turn.
                        setActiveDashboard({
                            id: payload.conversation_id,
                            title: question,
                            dataset: 'sales',
                            widgets: [],
                            reasoningSteps: [],
                        })
                    } else if (eventType === 'reasoning') {
                        reasoningSteps.push({ title: payload.message, tool: payload.step })
                        patchActiveDashboard({ reasoningSteps: [...reasoningSteps] })
                    } else if (eventType === 'dashboard') {
                        patchActiveDashboard({ widgets: payload.widgets, summary: payload.summary })
                    } else if (eventType === 'error') {
                        setError(payload.message)
                    }
                }
            }

            // New turn is persisted server-side — refresh the sidebar to reflect it.
            await refresh()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setStreaming(false)
        }
    }

    return { submit }
}

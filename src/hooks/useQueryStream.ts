import { useChatStore } from '@/store/useChatStore'
import { useConversations } from '@/hooks/useConversations'
import { API_BASE } from '@/lib/api'
import type { ReasoningStep } from '@/types'

// Only one stream runs at a time — a module-level controller lets a Stop button
// in any component abort the in-flight request.
let activeController: AbortController | null = null

export function useQueryStream() {
    const setStreaming = useChatStore((s) => s.setStreaming)
    const setError = useChatStore((s) => s.setError)
    const appendUserTurn = useChatStore((s) => s.appendUserTurn)
    const patchLastTurn = useChatStore((s) => s.patchLastTurn)
    const appendSummaryToken = useChatStore((s) => s.appendSummaryToken)
    const setLastTurnStatus = useChatStore((s) => s.setLastTurnStatus)
    const removeLastTurn = useChatStore((s) => s.removeLastTurn)
    const setActiveConversation = useChatStore((s) => s.setActiveConversation)
    const { refresh } = useConversations()

    // conversationId present => follow-up turn on an existing conversation.
    const submit = async (question: string, conversationId?: string | null) => {
        setStreaming(true)
        setError(null)
        appendUserTurn(question)   // optimistic: a pending assistant turn appears immediately

        const reasoningSteps: ReasoningStep[] = []
        let errored = false
        const controller = new AbortController()
        activeController = controller

        try {
            const response = await fetch(`${API_BASE}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, conversation_id: conversationId ?? null }),
                signal: controller.signal,
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
                        setActiveConversation(payload.conversation_id, question)
                    } else if (eventType === 'reasoning') {
                        reasoningSteps.push({ title: payload.message, tool: payload.step })
                        patchLastTurn({ reasoningSteps: [...reasoningSteps] })
                    } else if (eventType === 'summary_token') {
                        // Prose insight streams in token-by-token before the charts arrive.
                        appendSummaryToken(payload.token)
                    } else if (eventType === 'dashboard') {
                        // Summary was already streamed via summary_token — only patch charts
                        // here so we don't clobber the revealed text.
                        patchLastTurn({ widgets: payload.widgets })
                    } else if (eventType === 'message') {
                        // Conversational reply (greeting / clarification / decline / no-data)
                        patchLastTurn({ summary: payload.message })
                    } else if (eventType === 'error') {
                        errored = true
                        setError(payload.message)
                        setLastTurnStatus('error', payload.message)
                    }
                }
            }

            if (!errored) setLastTurnStatus('complete')
            await refresh()   // new turn is persisted — reflect it in the sidebar
        } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') {
                // User hit Stop — keep whatever streamed so far, mark the turn done.
                setLastTurnStatus('complete')
            } else {
                const msg = e instanceof Error ? e.message : String(e)
                setError(msg)
                setLastTurnStatus('error', msg)
            }
        } finally {
            activeController = null
            setStreaming(false)
        }
    }

    const stop = () => activeController?.abort()

    // Retry: drop the last turn and re-ask the same question.
    const retry = async (conversationId: string | null) => {
        const { turns } = useChatStore.getState()
        const last = turns.at(-1)
        if (!last) return
        removeLastTurn()
        await submit(last.question, conversationId)
    }

    return { submit, stop, retry }
}

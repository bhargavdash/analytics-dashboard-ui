import { useCallback } from 'react'
import { useDashboardStore } from '@/store/useDashboardStore'
import { listConversations, getConversation, deleteConversation } from '@/lib/api'
import type { Dashboard, Turn } from '@/types'

// A loaded dashboard always reflects the conversation's latest turn.
function turnToDashboard(
    convId: string,
    title: string,
    dataset: string,
    turn: Turn,
): Dashboard {
    return {
        id: convId,
        title,
        dataset,
        summary: turn.summary ?? undefined,
        widgets: turn.widgets,
        reasoningSteps: turn.reasoningSteps,
    }
}

export function useConversations() {
    const setConversations = useDashboardStore((s) => s.setConversations)
    const setActiveDashboard = useDashboardStore((s) => s.setActiveDashboard)
    const openConversationView = useDashboardStore((s) => s.openConversation)
    const newConversation = useDashboardStore((s) => s.newConversation)

    const refresh = useCallback(async () => {
        try {
            setConversations(await listConversations())
        } catch (e) {
            console.error('Failed to load conversations', e)
        }
    }, [setConversations])

    const open = useCallback(async (id: string) => {
        openConversationView(id)   // snappy view switch; content streams in below
        try {
            const convo = await getConversation(id)
            const latest = convo.turns.at(-1)
            if (latest) {
                setActiveDashboard(turnToDashboard(convo.id, convo.title, convo.dataset, latest))
            }
        } catch (e) {
            console.error('Failed to open conversation', e)
        }
    }, [openConversationView, setActiveDashboard])

    const remove = useCallback(async (id: string) => {
        try {
            await deleteConversation(id)
            newConversation()
            await refresh()
        } catch (e) {
            console.error('Failed to delete conversation', e)
        }
    }, [newConversation, refresh])

    return { refresh, open, remove }
}

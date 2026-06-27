import { useCallback } from 'react'
import { useChatStore } from '@/store/useChatStore'
import {
    listConversations,
    getConversation,
    deleteConversation,
    renameConversation,
} from '@/lib/api'
import type { ChatTurn, Turn } from '@/types'

function toChatTurn(t: Turn): ChatTurn {
    return {
        id: t.id,
        question: t.question,
        summary: t.summary,
        widgets: t.widgets,
        reasoningSteps: t.reasoningSteps,
        status: 'complete',
    }
}

export function useConversations() {
    const setConversations = useChatStore((s) => s.setConversations)
    const loadConversation = useChatStore((s) => s.loadConversation)
    const startNewChat = useChatStore((s) => s.startNewChat)
    const renameLocal = useChatStore((s) => s.renameConversationLocal)

    const refresh = useCallback(async () => {
        try {
            setConversations(await listConversations())
        } catch (e) {
            console.error('Failed to load conversations', e)
        }
    }, [setConversations])

    // Load a full conversation thread (all turns) into the active view.
    const open = useCallback(async (id: string) => {
        try {
            const convo = await getConversation(id)
            loadConversation(convo.id, convo.title, convo.turns.map(toChatTurn))
        } catch (e) {
            console.error('Failed to open conversation', e)
        }
    }, [loadConversation])

    const remove = useCallback(async (id: string) => {
        try {
            await deleteConversation(id)
            startNewChat()
            await refresh()
        } catch (e) {
            console.error('Failed to delete conversation', e)
        }
    }, [startNewChat, refresh])

    const rename = useCallback(async (id: string, title: string) => {
        const trimmed = title.trim()
        if (!trimmed) return
        renameLocal(id, trimmed)   // optimistic
        try {
            await renameConversation(id, trimmed)
            await refresh()
        } catch (e) {
            console.error('Failed to rename conversation', e)
        }
    }, [renameLocal, refresh])

    return { refresh, open, remove, rename }
}

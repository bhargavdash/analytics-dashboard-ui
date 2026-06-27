import { create } from 'zustand';
import type { ChatTurn, ConversationMeta } from '../types';

type ChatStore = {
    conversations: ConversationMeta[];   // sidebar list (lightweight meta)
    activeId: string | null;             // active conversation id (null = unsaved new chat)
    title: string | null;                // active conversation title
    turns: ChatTurn[];                   // the active thread, oldest first
    searchQuery: string;
    isStreaming: boolean;
    error: string | null;
    theme: 'light' | 'dark';

    // sidebar
    setConversations: (conversations: ConversationMeta[]) => void;
    renameConversationLocal: (id: string, title: string) => void;

    // thread lifecycle
    startNewChat: () => void;
    loadConversation: (id: string, title: string, turns: ChatTurn[]) => void;
    setActiveConversation: (id: string, title: string) => void;   // from the stream `meta` event

    // streaming a turn (the last turn is always the in-flight one)
    appendUserTurn: (question: string) => void;
    patchLastTurn: (partial: Partial<ChatTurn>) => void;
    appendSummaryToken: (token: string) => void;
    setLastTurnStatus: (status: ChatTurn['status'], error?: string) => void;
    removeLastTurn: () => void;

    setSearchQuery: (query: string) => void;
    setStreaming: (isStreaming: boolean) => void;
    setError: (error: string | null) => void;
    toggleTheme: () => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
    conversations: [],
    activeId: null,
    title: null,
    turns: [],
    searchQuery: '',
    isStreaming: false,
    error: null,
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',

    setConversations: (conversations) => set({ conversations }),
    renameConversationLocal: (id, title) => set((state) => ({
        conversations: state.conversations.map((c) => c.id === id ? { ...c, title } : c),
        title: state.activeId === id ? title : state.title,
    })),

    startNewChat: () => set({ activeId: null, title: null, turns: [], error: null }),
    loadConversation: (id, title, turns) => set({ activeId: id, title, turns, error: null }),
    setActiveConversation: (id, title) => set((state) => ({
        activeId: id,
        title: state.title ?? title,
    })),

    appendUserTurn: (question) => set((state) => ({
        turns: [...state.turns, {
            id: `pending-${Date.now()}`,
            question,
            summary: null,
            widgets: [],
            reasoningSteps: [],
            status: 'streaming' as const,
        }],
    })),
    // Patch the in-flight (last) turn. New array refs so React re-renders.
    patchLastTurn: (partial) => set((state) => {
        if (state.turns.length === 0) return {};
        const turns = state.turns.slice();
        turns[turns.length - 1] = { ...turns[turns.length - 1], ...partial };
        return { turns };
    }),
    // Append a streamed token to the in-flight turn's summary (typewriter reveal).
    appendSummaryToken: (token) => set((state) => {
        if (state.turns.length === 0) return {};
        const turns = state.turns.slice();
        const last = turns[turns.length - 1];
        turns[turns.length - 1] = { ...last, summary: (last.summary ?? '') + token };
        return { turns };
    }),
    setLastTurnStatus: (status, error) => set((state) => {
        if (state.turns.length === 0) return {};
        const turns = state.turns.slice();
        turns[turns.length - 1] = { ...turns[turns.length - 1], status, error };
        return { turns };
    }),
    removeLastTurn: () => set((state) => ({ turns: state.turns.slice(0, -1) })),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setStreaming: (isStreaming) => set({ isStreaming }),
    setError: (error) => set({ error }),
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))

import { create } from 'zustand';
import type { ConversationMeta, Dashboard } from '../types';

type DashboardStore = {
    view: 'empty' | 'dash';
    conversations: ConversationMeta[];   // sidebar list (lightweight meta)
    activeId: string | null;             // active conversation id
    activeDashboard: Dashboard | null;   // the rendered turn for activeId
    searchQuery: string;
    reasoningOpen: boolean;
    isStreaming: boolean;
    error: string | null;
    theme: 'light' | 'dark';

    // actions
    setConversations: (conversations: ConversationMeta[]) => void;
    setActiveDashboard: (dashboard: Dashboard | null) => void;
    patchActiveDashboard: (partial: Partial<Dashboard>) => void;
    openConversation: (id: string) => void;   // switches to dash view; content loaded by hook
    newConversation: () => void;              // back to empty composer
    setSearchQuery: (query: string) => void;
    toggleReasoningOpen: () => void;
    setStreaming: (isStreaming: boolean) => void;
    setError: (error: string | null) => void;
    toggleTheme: () => void;
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
    view: 'empty',
    conversations: [],
    activeId: null,
    activeDashboard: null,
    searchQuery: '',
    reasoningOpen: false,
    isStreaming: false,
    error: null,
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',

    setConversations: (conversations) => set({ conversations }),
    setActiveDashboard: (dashboard) => set({
        activeDashboard: dashboard,
        activeId: dashboard?.id ?? null,
        view: dashboard ? 'dash' : 'empty',
    }),
    // Live-update the rendered dashboard as stream events arrive (reasoning steps,
    // then widgets). Only patches when there's an active dashboard to patch.
    patchActiveDashboard: (partial) => set((state) =>
        state.activeDashboard
            ? { activeDashboard: { ...state.activeDashboard, ...partial } }
            : {}
    ),
    openConversation: (id) => set({ activeId: id, view: 'dash', reasoningOpen: false }),
    newConversation: () => set({
        activeId: null,
        activeDashboard: null,
        view: 'empty',
        error: null,
    }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    toggleReasoningOpen: () => set((state) => ({ reasoningOpen: !state.reasoningOpen })),
    setStreaming: (isStreaming) => set({ isStreaming }),
    setError: (error) => set({ error }),
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))

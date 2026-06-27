import { create } from 'zustand';
import type { Dashboard } from '../types';

type DashboardStore = {
    view: 'empty' | 'dash';
    dashboards: Dashboard[];
    activeId: string | null;
    searchQuery: string;
    reasoningOpen: boolean;
    isStreaming: boolean;
    shownWidgetCount: number;
    theme: 'light' | 'dark';

    // actions 
    addDashboard: (dashboard: Dashboard) => void;
    selectDashboard: (id: string | null) => void;
    setDashboards: (dashboards: Dashboard[]) => void;
    setSearchQuery: (query: string) => void;
    toggleReasoningOpen: () => void;
    setStreaming: (isStreaming: boolean) => void;
    setShownWidgetCount: (count: number) => void;
    toggleTheme: () => void;
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
    view: 'empty',
    dashboards: [],
    activeId: null,
    searchQuery: '',
    reasoningOpen: false,
    isStreaming: false,
    shownWidgetCount: 0,
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',

    selectDashboard: (id: string | null) => set({
        activeId: id,
        view: id ? 'dash' : 'empty'
    }),
    setDashboards: (dashboards) => set({ dashboards }),
    addDashboard: (dashboard) => set((state) => ({
        dashboards: [dashboard, ...state.dashboards],
        activeId: dashboard.id,
        view: 'dash',
    })),
    setSearchQuery: (query) => set({ searchQuery: query }),
    toggleReasoningOpen: () => set((state) => ({ reasoningOpen: !state.reasoningOpen })),
    setStreaming: (isStreaming) => set({ isStreaming }),
    setShownWidgetCount: (count) => set({ shownWidgetCount: count }),
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

}))
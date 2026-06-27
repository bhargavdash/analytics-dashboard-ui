import { Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar'
import { useDashboardStore } from '@/store/useDashboardStore'
import { useConversations } from '@/hooks/useConversations'

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

export const AppSidebar = () => {
    const conversations = useDashboardStore((state) => state.conversations)
    const searchQuery = useDashboardStore((state) => state.searchQuery)
    const activeId = useDashboardStore((state) => state.activeId)
    const setSearchQuery = useDashboardStore((state) => state.setSearchQuery)
    const newConversation = useDashboardStore((state) => state.newConversation)
    const { open, remove } = useConversations()

    const filtered = conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-3">
                <p className="text-sm font-semibold">Helix {" "}{"•"}{" "} POC</p>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3 flex flex-col gap-3">
                {/* Actions */}
                <div className="flex flex-col gap-2 px-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={newConversation}
                    >
                        <Plus className="size-4" />
                        New dashboard
                    </Button>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground">
                        <Search className="size-3.5 shrink-0" />
                        <input
                            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                            placeholder="Search dashboards…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Conversation list */}
                <SidebarMenu>
                    {filtered.map((convo) => (
                        <SidebarMenuItem key={convo.id} className="group/item relative">
                            <SidebarMenuButton
                                isActive={convo.id === activeId}
                                onClick={() => open(convo.id)}
                                className="flex flex-col items-start gap-0.5 h-auto py-2 pr-8"
                            >
                                <span className="text-sm font-medium leading-tight line-clamp-1">
                                    {convo.title}
                                </span>
                                <span className="text-xs text-muted-foreground font-normal">
                                    {relativeTime(convo.updated_at)} · {convo.widget_count ?? 0} widgets · {convo.turn_count} {convo.turn_count === 1 ? 'turn' : 'turns'}
                                </span>
                            </SidebarMenuButton>
                            <button
                                aria-label="Delete conversation"
                                onClick={(e) => { e.stopPropagation(); remove(convo.id) }}
                                className="absolute right-1.5 top-1.5 opacity-0 group-hover/item:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-opacity"
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        </SidebarMenuItem>
                    ))}
                    {filtered.length === 0 && (
                        <p className="px-2 py-4 text-xs text-muted-foreground">
                            {conversations.length === 0 ? 'No dashboards yet — ask a question to begin.' : 'No dashboards match.'}
                        </p>
                    )}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

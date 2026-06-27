import { useState } from 'react'
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { Button } from '../ui/button'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar'
import { useChatStore } from '@/store/useChatStore'
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
    const conversations = useChatStore((state) => state.conversations)
    const searchQuery = useChatStore((state) => state.searchQuery)
    const activeId = useChatStore((state) => state.activeId)
    const setSearchQuery = useChatStore((state) => state.setSearchQuery)
    const startNewChat = useChatStore((state) => state.startNewChat)
    const { open, remove, rename } = useConversations()

    const [editingId, setEditingId] = useState<string | null>(null)
    const [draft, setDraft] = useState('')

    const filtered = conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const commitRename = (id: string) => {
        if (draft.trim()) rename(id, draft)
        setEditingId(null)
    }

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-3">
                <p className="text-sm font-semibold">Helix</p>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3 flex flex-col gap-3">
                <div className="flex flex-col gap-2 px-2">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={startNewChat}>
                        <Plus className="size-4" />
                        New analysis
                    </Button>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground">
                        <Search className="size-3.5 shrink-0" />
                        <input
                            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                            placeholder="Search conversations…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <SidebarMenu>
                    {filtered.map((convo) => (
                        <SidebarMenuItem key={convo.id} className="group/item relative">
                            {editingId === convo.id ? (
                                <input
                                    autoFocus
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onBlur={() => commitRename(convo.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') commitRename(convo.id)
                                        if (e.key === 'Escape') setEditingId(null)
                                    }}
                                    className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none"
                                />
                            ) : (
                                <>
                                    <SidebarMenuButton
                                        isActive={convo.id === activeId}
                                        onClick={() => open(convo.id)}
                                        className="flex flex-col items-start gap-0.5 h-auto py-2 pr-14"
                                    >
                                        <span className="text-sm font-medium leading-tight line-clamp-1">
                                            {convo.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            {relativeTime(convo.updated_at)} · {convo.turn_count} {convo.turn_count === 1 ? 'turn' : 'turns'}
                                        </span>
                                    </SidebarMenuButton>
                                    <div className="absolute right-1.5 top-1.5 flex gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <button
                                            aria-label="Rename conversation"
                                            onClick={(e) => { e.stopPropagation(); setEditingId(convo.id); setDraft(convo.title) }}
                                            className="p-1 rounded text-muted-foreground hover:text-foreground"
                                        >
                                            <Pencil className="size-3.5" />
                                        </button>
                                        <button
                                            aria-label="Delete conversation"
                                            onClick={(e) => { e.stopPropagation(); remove(convo.id) }}
                                            className="p-1 rounded text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </SidebarMenuItem>
                    ))}
                    {filtered.length === 0 && (
                        <p className="px-2 py-4 text-xs text-muted-foreground">
                            {conversations.length === 0 ? 'No conversations yet — ask a question to begin.' : 'No conversations match.'}
                        </p>
                    )}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

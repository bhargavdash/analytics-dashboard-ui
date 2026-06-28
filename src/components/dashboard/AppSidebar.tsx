import { Plus, Search } from 'lucide-react'
import { Button } from '../ui/button'
import { Sidebar, SidebarContent, SidebarHeader } from '../ui/sidebar'
import { useChatStore } from '@/store/useChatStore'
import { useConversations } from '@/hooks/useConversations'
import { ConversationList } from './ConversationList'

export const AppSidebar = () => {
    const conversations = useChatStore((state) => state.conversations)
    const searchQuery = useChatStore((state) => state.searchQuery)
    const activeId = useChatStore((state) => state.activeId)
    const setSearchQuery = useChatStore((state) => state.setSearchQuery)
    const startNewChat = useChatStore((state) => state.startNewChat)
    const { open, remove, rename } = useConversations()

    const filtered = conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-3">
                <p className="text-sm font-semibold">Helix</p>
            </SidebarHeader>

            <SidebarContent
                role="navigation"
                aria-label="Conversation history"
                className="flex flex-col gap-3 py-3"
            >
                <div className="flex flex-col gap-2 px-4">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={startNewChat}
                    >
                        <Plus className="size-4" />
                        New analysis
                    </Button>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
                        <Search className="size-3.5 shrink-0" />
                        <input
                            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                            placeholder="Search conversations…"
                            aria-label="Search conversations"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {filtered.length === 0 && conversations.length > 0 ? (
                    <p className="px-4 py-4 text-xs text-muted-foreground">No conversations match.</p>
                ) : (
                    <ConversationList
                        conversations={filtered}
                        activeId={activeId}
                        onOpen={open}
                        onRemove={remove}
                        onRename={rename}
                    />
                )}
            </SidebarContent>
        </Sidebar>
    )
}

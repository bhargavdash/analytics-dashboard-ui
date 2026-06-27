import { useEffect } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { TopBar } from '@/components/layout/TopBar'
import { ChatThread } from '@/components/chat/ChatThread'
import { EmptyHero } from '@/components/chat/EmptyHero'
import { useChatStore } from '@/store/useChatStore'
import { useConversations } from '@/hooks/useConversations'

function App() {
  const theme = useChatStore((state) => state.theme)
  const hasThread = useChatStore((state) => state.turns.length > 0)
  const { refresh } = useConversations()

  useEffect(() => {
    refresh()   // load past conversations into the sidebar on boot
  }, [refresh])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-svh flex-col">
        <TopBar />
        {hasThread ? <ChatThread /> : <EmptyHero />}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App

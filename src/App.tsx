import { useEffect } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { TopBar } from '@/components/layout/TopBar'
import { ChatThread } from '@/components/chat/ChatThread'
import { EmptyHero } from '@/components/chat/EmptyHero'
import { DropOverlay } from '@/components/chat/DropOverlay'
import { LiveAnnouncer } from '@/components/chat/LiveAnnouncer'
import { useChatStore } from '@/store/useChatStore'
import { useConversations } from '@/hooks/useConversations'
import { useDatasetUpload } from '@/hooks/useDatasetUpload'

function App() {
  const theme = useChatStore((state) => state.theme)
  const hasThread = useChatStore((state) => state.turns.length > 0)
  const { refresh } = useConversations()
  // Global drag-drop: works anywhere in the app, even mid-thread.
  const { isDragging, uploading, error: uploadError, upload } = useDatasetUpload()

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
        {hasThread ? (
          <ChatThread />
        ) : (
          <EmptyHero onUpload={upload} uploading={uploading} uploadError={uploadError} />
        )}
      </SidebarInset>
      {(isDragging || uploading) && <DropOverlay uploading={uploading} />}
      <LiveAnnouncer />
    </SidebarProvider>
  )
}

export default App

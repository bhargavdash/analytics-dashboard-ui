import { useEffect } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { TopBar } from '@/components/layout/TopBar'
import { ReasoningDrawer } from '@/components/layout/ReasoningDrawer'
import { useDashboardStore } from '@/store/useDashboardStore'
import { SEED_DASHBOARDS } from '@/data/seed'
import { EmptyState } from './components/empty/EmptyState'

function App() {
  const setDashboards = useDashboardStore((state) => state.setDashboards)
  const view = useDashboardStore((state) => state.view)
  const theme = useDashboardStore((state) => state.theme)

  useEffect(() => {
    setDashboards(SEED_DASHBOARDS)
  }, [setDashboards])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          {view === 'dash' ? <Dashboard /> : <EmptyState />}
        </SidebarInset>
      </SidebarProvider>
      <ReasoningDrawer />
    </>
  )
}

export default App

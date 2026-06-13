import { useEffect } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { useDashboardStore } from '@/store/useDashboardStore'
import { SEED_DASHBOARDS } from '@/data/seed'
import { EmptyState } from './components/empty/EmptyState'

function App() {
  const setDashboards = useDashboardStore((state) => state.setDashboards)
  const view = useDashboardStore((state) => state.view)

  useEffect(() => {
    setDashboards(SEED_DASHBOARDS)
  }, [setDashboards])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger />
        {view === 'dash' ? <Dashboard /> : <EmptyState />}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App

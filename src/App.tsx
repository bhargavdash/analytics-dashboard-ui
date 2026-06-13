import { useEffect } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { useDashboardStore } from '@/store/useDashboardStore'
import { SEED_DASHBOARDS } from '@/data/seed'

function App() {
  const setDashboards = useDashboardStore((state) => state.setDashboards)

  // Seed store on first mount.
  // Sprint 4: replace this with an API call to load saved dashboards.
  useEffect(() => {
    setDashboards(SEED_DASHBOARDS)
  }, [setDashboards])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger />
        {/* Dashboard or EmptyState renders here */}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App

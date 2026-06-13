import { useEffect } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { AISummaryCard } from '@/components/dashboard/AISummaryCard'
import { useDashboardStore } from '@/store/useDashboardStore'
import { SEED_DASHBOARDS } from '@/data/seed'

function App() {
  const setDashboards = useDashboardStore((state) => state.setDashboards)

  useEffect(() => {
    setDashboards(SEED_DASHBOARDS)
  }, [setDashboards])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger />
        {/* Temporary preview — remove when Dashboard.tsx is wired up in 2.18 */}
        <div className="p-6 max-w-2xl">
          <AISummaryCard dashboard={SEED_DASHBOARDS[0]} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App

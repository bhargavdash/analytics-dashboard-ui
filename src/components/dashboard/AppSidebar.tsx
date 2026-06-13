import { Plus, Search } from 'lucide-react'
import { Button } from '../ui/button'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar'
import { useDashboardStore } from '@/store/useDashboardStore'

export const AppSidebar = () => {
    const dashboards = useDashboardStore((state) => state.dashboards)
    const searchQuery = useDashboardStore((state) => state.searchQuery)
    const activeId = useDashboardStore((state) => state.activeId)
    const selectDashboard = useDashboardStore((state) => state.selectDashboard)
    const setSearchQuery = useDashboardStore((state) => state.setSearchQuery)

    const filtered = dashboards.filter((d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-3">
                <p className="text-sm font-semibold">Helix - POC</p>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3 flex flex-col gap-3">
                {/* Actions */}
                <div className="flex flex-col gap-2 px-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => selectDashboard(null)}
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

                {/* Dashboard list */}
                <SidebarMenu>
                    {filtered.map((dashboard) => (
                        <SidebarMenuItem key={dashboard.id}>
                            <SidebarMenuButton
                                isActive={dashboard.id === activeId}
                                onClick={() => selectDashboard(dashboard.id)}
                                className="flex flex-col items-start gap-0.5 h-auto py-2"
                            >
                                <span className="text-sm font-medium leading-tight line-clamp-1">
                                    {dashboard.title}
                                </span>
                                <span className="text-xs text-muted-foreground font-normal">
                                    {dashboard.createdAt} · {dashboard.widgetCount} widgets · {dashboard.dataset}
                                </span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    {filtered.length === 0 && (
                        <p className="px-2 py-4 text-xs text-muted-foreground">No dashboards match.</p>
                    )}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

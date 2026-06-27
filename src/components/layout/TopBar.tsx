import { Brain, Moon, Sun } from 'lucide-react'
import { useDashboardStore } from '@/store/useDashboardStore'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export const TopBar = () => {
    const activeId = useDashboardStore(s => s.activeId)
    const activeDashboard = useDashboardStore(s => s.activeDashboard)
    const newConversation = useDashboardStore(s => s.newConversation)
    const isStreaming = useDashboardStore(s => s.isStreaming)
    const toggleReasoningOpen = useDashboardStore(s => s.toggleReasoningOpen)
    const theme = useDashboardStore((state) => state.theme);
    const toggleTheme = useDashboardStore((state) => state.toggleTheme);
    const title = activeDashboard?.title

    return (
        <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b bg-background px-4">

            {/* Left — sidebar trigger + breadcrumb */}
            <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={newConversation} className="cursor-pointer">
                                Dashboards
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {title && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Right — streaming badge + reasoning button */}
            <div className="flex items-center gap-2">
                {isStreaming && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Streaming
                    </span>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleReasoningOpen}
                    disabled={!activeId}
                >
                    <Brain className="size-3.5" />
                    Reasoning
                </Button>
                <div className="flex items-center gap-1.5">
                    <Sun className="size-3.5 text-muted-foreground" />
                    <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                    <Moon className="size-3.5 text-muted-foreground" />
                </div>
            </div>

        </header>
    )
}

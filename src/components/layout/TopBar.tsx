import { Moon, Sun } from 'lucide-react'
import { useChatStore } from '@/store/useChatStore'
import { Switch } from '@/components/ui/switch'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export const TopBar = () => {
    const title = useChatStore((s) => s.title)
    const startNewChat = useChatStore((s) => s.startNewChat)
    const isStreaming = useChatStore((s) => s.isStreaming)
    const theme = useChatStore((state) => state.theme)
    const toggleTheme = useChatStore((state) => state.toggleTheme)

    return (
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={startNewChat} className="cursor-pointer">
                                Helix
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {title && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="line-clamp-1 max-w-[40ch]">{title}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-2">
                {isStreaming && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Streaming
                    </span>
                )}
                <div className="flex items-center gap-1.5">
                    <Sun className="size-3.5 text-muted-foreground" />
                    <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                    <Moon className="size-3.5 text-muted-foreground" />
                </div>
            </div>
        </header>
    )
}

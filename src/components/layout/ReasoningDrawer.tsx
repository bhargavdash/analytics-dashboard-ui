import { useDashboardStore } from '@/store/useDashboardStore'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export const ReasoningDrawer = () => {
    const reasoningOpen = useDashboardStore(s => s.reasoningOpen)
    const toggleReasoning = useDashboardStore(s => s.toggleReasoningOpen)
    const dashboards = useDashboardStore(s => s.dashboards)
    const activeId = useDashboardStore(s => s.activeId)
    const steps = dashboards.find(d => d.id === activeId)?.reasoningSteps ?? []

    return (
        <Sheet open={reasoningOpen} onOpenChange={toggleReasoning}>
            <SheetContent side="right" className="w-[380px] flex flex-col gap-0 p-0">
                <SheetHeader className="px-4 py-3 border-b">
                    <SheetTitle className="text-sm">Reasoning trace</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {step.tool}
                                </span>
                                <span className="text-sm font-medium">{step.title}</span>
                            </div>
                            {step.detail && (
                                <p className="text-xs text-muted-foreground">{step.detail}</p>
                            )}
                            {step.code && (
                                <pre className="text-xs bg-muted rounded p-2 overflow-x-auto whitespace-pre-wrap">
                                    {step.code}
                                </pre>
                            )}
                            {step.pills && (
                                <div className="flex flex-wrap gap-1">
                                    {step.pills.map(pill => (
                                        <span key={pill} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                            {pill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}

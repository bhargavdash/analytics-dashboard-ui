import { useDashboardStore } from "@/store/useDashboardStore"
import { AISummaryCard } from "./AISummaryCard";
import { Widget } from "./Widget";
import { FollowupComposer } from "./FollowupComposer";

const spanClass: Record<number, string> = {
    1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
    5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
    9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
}

export const Dashboard = () => {
    const currentDashboard = useDashboardStore((state) => state.activeDashboard);
    const isStreaming = useDashboardStore((state) => state.isStreaming);
    const error = useDashboardStore((state) => state.error);

    if (!currentDashboard) return null;

    return (
        <div className="p-6 flex flex-col gap-6">
            {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {currentDashboard.summary && <AISummaryCard dashboard={currentDashboard} />}

            <div className="grid grid-cols-12 gap-4">
                {currentDashboard.widgets.map((widget, i) => (
                    <div key={i} className={spanClass[widget.span]}>
                        <Widget w={widget} />
                    </div>
                ))}
            </div>

            {isStreaming && currentDashboard.widgets.length === 0 && (
                <p className="text-sm text-muted-foreground">Building your dashboard…</p>
            )}

            <FollowupComposer />
        </div>
    )
}

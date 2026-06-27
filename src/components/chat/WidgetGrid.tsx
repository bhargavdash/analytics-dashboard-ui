import type { Widget as WidgetType } from '@/types'
import { cn } from '@/lib/utils'
import { Widget } from '../dashboard/Widget'
import { Skeleton } from '../ui/skeleton'

const spanClass: Record<number, string> = {
    1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
    5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
    9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
}

export const WidgetGrid = ({ widgets }: { widgets: WidgetType[] }) => {
    if (widgets.length === 0) return null
    return (
        <div className="grid grid-cols-12 gap-4">
            {widgets.map((widget, i) => (
                <div key={i} className={spanClass[widget.span] ?? 'col-span-12'}>
                    <Widget w={widget} />
                </div>
            ))}
        </div>
    )
}

// A card-shaped placeholder that mirrors a real widget's frame (title line + body),
// so the layout doesn't jump when the real charts replace it.
const SkeletonCard = ({ className }: { className?: string }) => (
    <div className={cn('rounded-xl border bg-card p-4', className)}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-[calc(100%-1.75rem)] w-full" />
    </div>
)

// Shown in the gap between "charts are being designed" and the dashboard event,
// so a tall answer doesn't leave dead space below the streamed insight.
export const WidgetGridSkeleton = () => (
    <div className="grid grid-cols-12 gap-4">
        <SkeletonCard className="col-span-3 h-28" />
        <SkeletonCard className="col-span-9 h-64" />
        <SkeletonCard className="col-span-12 h-56" />
    </div>
)

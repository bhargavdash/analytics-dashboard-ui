import { memo, lazy, Suspense } from 'react'
import type { Widget as WidgetType } from '@/types'
import { cn } from '@/lib/utils'
import { Skeleton } from '../ui/skeleton'

// Lazy-load the chart dispatcher. The entire Recharts dependency is reachable only through
// `Widget` and its leaf chart components, so this single boundary code-splits all of Recharts
// (~hundreds of KB) into an async chunk that's fetched on first render of a chart — which only
// ever happens after the first streaming answer, never on initial app load.
const Widget = lazy(() => import('../dashboard/Widget').then((m) => ({ default: m.Widget })))

const spanClass: Record<number, string> = {
    1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
    5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
    9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
}

// Memoized: while a turn streams, summary tokens patch the turn object on every frame, but
// `widgets` only changes once (when the `dashboard` event lands). Memoizing on the widgets
// array reference means the charts don't re-render — and Recharts doesn't re-layout — on each
// of the ~80 token patches.
export const WidgetGrid = memo(({ widgets }: { widgets: WidgetType[] }) => {
    if (widgets.length === 0) return null
    return (
        <div className="grid grid-cols-12 gap-4">
            {widgets.map((widget, i) => (
                <div key={i} className={spanClass[widget.span] ?? 'col-span-12'}>
                    <Suspense fallback={<SkeletonCard className="h-full min-h-28" />}>
                        <Widget w={widget} />
                    </Suspense>
                </div>
            ))}
        </div>
    )
})
WidgetGrid.displayName = 'WidgetGrid'

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

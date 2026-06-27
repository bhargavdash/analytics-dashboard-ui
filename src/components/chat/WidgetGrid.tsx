import type { Widget as WidgetType } from '@/types'
import { Widget } from '../dashboard/Widget'

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

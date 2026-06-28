import { memo } from 'react';
import type { Widget as WidgetType } from '../../types';
import { StatCard } from './widgets/StatCard';
import { LineChart } from './widgets/LineChart';
import { BarChart } from './widgets/BarChart';
import { PieChart } from './widgets/PieChart';
import { TableWidget } from './widgets/TableWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type WidgetProps = {
    w: WidgetType;
}

// A human-readable label for the chart, so a screen reader announces what the (otherwise
// opaque) SVG visualization represents instead of skipping it. Recharts renders no text
// alternative of its own, so we derive one from the widget type + title.
function chartAriaLabel(w: WidgetType): string {
    const kind = {
        bar_chart: 'Bar chart',
        line_chart: 'Line chart',
        pie_chart: 'Pie chart',
        table: 'Table',
        stat_card: 'Statistic',
    }[w.type];
    return `${kind}: ${w.title}`;
}

// The dispatcher — reads w.type, narrows the discriminated union, and renders the exact
// component with the exact payload shape. TypeScript guarantees payload type correctness in
// each branch. Memoized so it doesn't re-render when an unrelated turn patch occurs.
export const Widget = memo(({ w }: WidgetProps) => {
    if (w.type === 'stat_card') {
        return <StatCard title={w.title} payload={w.payload} />;
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{w.title}</CardTitle>
            </CardHeader>
            <CardContent>
                {/* role="img" + label gives the opaque SVG charts a text alternative. The
                    table is left as a native table so its row/column semantics survive. */}
                {w.type === 'line_chart' && (
                    <div role="img" aria-label={chartAriaLabel(w)}>
                        <LineChart title={w.title} payload={w.payload} />
                    </div>
                )}
                {w.type === 'bar_chart' && (
                    <div role="img" aria-label={chartAriaLabel(w)}>
                        <BarChart title={w.title} payload={w.payload} />
                    </div>
                )}
                {w.type === 'pie_chart' && (
                    <div role="img" aria-label={chartAriaLabel(w)}>
                        <PieChart title={w.title} payload={w.payload} />
                    </div>
                )}
                {w.type === 'table' && <TableWidget payload={w.payload} />}
            </CardContent>
        </Card>
    );
});
Widget.displayName = 'Widget';

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

// The dispatcher — reads w.type, narrows the discriminated union,
// and renders the exact component with the exact payload shape.
// TypeScript guarantees payload type correctness in each branch.
export const Widget = ({ w }: WidgetProps) => {
    if (w.type === 'stat_card') {
        return <StatCard title={w.title} payload={w.payload} />;
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{w.title}</CardTitle>
            </CardHeader>
            <CardContent>
                {w.type === 'line_chart' && <LineChart title={w.title} payload={w.payload} />}
                {w.type === 'bar_chart'  && <BarChart  title={w.title} payload={w.payload} />}
                {w.type === 'pie_chart'  && <PieChart  title={w.title} payload={w.payload} />}
                {w.type === 'table'      && <TableWidget payload={w.payload} />}
            </CardContent>
        </Card>
    );
}

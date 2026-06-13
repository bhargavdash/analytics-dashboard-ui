import {
    ResponsiveContainer,
    LineChart as ReactLineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from 'recharts';
import type { LineChartPayload } from '../../../types';

type LineChartProps = {
    title: string;
    payload: LineChartPayload;
}

export const LineChart = ({ payload }: LineChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <ReactLineChart data={payload.data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                    dataKey={payload.xKey}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    width={40}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => payload.unit ? `${v}${payload.unit}` : String(v)}
                />
                <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                />
                <Legend
                    iconType="plainline"
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                {payload.series.map((s) => (
                    <Line
                        key={s.key}
                        dataKey={s.key}
                        name={s.label ?? s.key}
                        stroke={s.color}
                        strokeWidth={2}
                        strokeDasharray={s.dashed ? '5 4' : undefined}
                        dot={{ r: 3, fill: s.color }}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                    />
                ))}
            </ReactLineChart>
        </ResponsiveContainer>
    );
}

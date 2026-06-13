import { ResponsiveContainer, BarChart as ReactBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { BarChartPayload } from '../../../types';

type BarChartProps = {
    title: string;
    payload: BarChartPayload;
}

export const BarChart = ({ payload }: BarChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <ReactBarChart data={payload.data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
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
                    cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                />
                {payload.series.map((s) => (
                    <Bar
                        key={s.key}
                        dataKey={s.key}
                        name={s.label ?? s.key}
                        fill={s.color}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
            </ReactBarChart>
        </ResponsiveContainer>
    );
}

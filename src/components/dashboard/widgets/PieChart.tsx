import { ResponsiveContainer, PieChart as ReactPieChart, Pie, Cell, Label } from 'recharts';
import type { PieChartPayload } from "../../../types/index";


type PieChartProps = {
    title: string;
    payload: PieChartPayload;
}

export const PieChart = ({ title, payload }: PieChartProps) => {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-lg font-semibold">{title}</div>
            <div className="flex items-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                    <ReactPieChart>
                        <Pie data={payload.slices} dataKey="value" innerRadius={60} outerRadius={100}>
                            {payload.slices.map((slice, i) => (
                                <Cell key={i} fill={slice.color} />
                            ))}
                            <Label value="Total" position="center" dy={-10}/>
                            <Label value="100%" position="center" dy={10}/>
                        </Pie>
                    </ReactPieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2">
                    {payload.slices.map((slice, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: slice.color }} />
                            <span>{slice.name}</span>
                            <span className="ml-auto text-muted-foreground">{slice.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
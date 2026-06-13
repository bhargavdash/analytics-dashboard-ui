import type { ReactNode } from 'react';

export type Widget = 
    | { type: 'stat_card'; span: number; title: string; payload: StatCardPayload }
    | { type: 'line_chart'; span: number; title: string; payload: LineChartPayload }
    | { type: 'pie_chart'; span: number; title: string; payload: PieChartPayload }
    | { type: 'bar_chart'; span: number; title: string; payload: BarChartPayload }
    | { type: 'table'; span: number; title: string; payload: TablePayload }

export interface StatCardPayload {
    value: string;
    delta?: string;
    up?: boolean;
    vs?: string;
}

// Row-object format — mirrors SQL query results directly.
// The LLM emits only the spec (xKey, series, columns, unit).
// The backend attaches `data` after running the SQL query.
export type DataRow = Record<string, string | number | null>

export interface LineChartPayload {
    data: DataRow[]
    xKey: string
    series: { key: string; color: string; label?: string; dashed?: boolean }[]
    unit?: string
}

export interface PieChartPayload {
    slices: { name: string; value: number; color: string }[]
}

export interface BarChartPayload {
    data: DataRow[]
    xKey: string
    series: { key: string; color: string; label?: string }[]
    unit?: string
}

export interface TablePayload {
    data: DataRow[]
    columns: { key: string; label: string }[]
}

export interface Dashboard {
    id: string;
    title: string;
    query: string;
    dataset: string;
    createdAt: string;
    widgetCount: number;
    widgets: Widget[];
    summary?: ReactNode;
}

export interface ReasoningStep {
    title: string;
    tool: string;
    detail?: string;
    code?: string;
    pills?: string[];
}
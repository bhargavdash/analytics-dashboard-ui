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

export interface LineChartPayload {
    x: string[];
    series: { name: string; color: string; data: (number | null)[]; dashed?: boolean }[];
    unit: string;
}

export interface PieChartPayload {
    slices: { name: string; value: number; color: string }[]
}

export interface BarChartPayload {
    x: string[];
    series: { name: string; color: string; data: (number | null)[] }[];
    unit: string;
}

export interface TablePayload {
    columns: string[];
    rows: (string | number)[][];
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
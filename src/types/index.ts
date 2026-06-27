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

// --- Chat thread rendering model (Phase A) ---

// One turn = a user question + the assistant's streamed/loaded response.
// Rendered as a user bubble followed by an assistant block.
export type TurnStatus = 'streaming' | 'complete' | 'error'

export interface ChatTurn {
    id: string;                 // turn id (temp id while streaming, real id after persist)
    question: string;
    summary?: string | null;
    widgets: Widget[];
    reasoningSteps: ReasoningStep[];
    status: TurnStatus;
    error?: string;
}

export interface ReasoningStep {
    title: string;
    tool: string;
    detail?: string;
    code?: string;
    pills?: string[];
}

// --- Server-backed conversation persistence ---

// Sidebar list item (GET /conversations).
export interface ConversationMeta {
    id: string;
    title: string;
    dataset: string;
    created_at: string;
    updated_at: string;
    turn_count: number;
    widget_count: number | null;
}

// One question→dashboard cycle within a conversation (GET /conversations/:id).
export interface Turn {
    id: string;
    seq: number;
    question: string;
    sql: string | null;
    summary: string | null;
    widgets: Widget[];
    reasoningSteps: ReasoningStep[];
    created_at: string;
}

export interface ConversationDetail {
    id: string;
    title: string;
    dataset: string;
    created_at: string;
    updated_at: string;
    turns: Turn[];
}
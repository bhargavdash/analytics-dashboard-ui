import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssistantTurn } from '@/components/chat/AssistantTurn'
import { useChatStore } from '@/store/useChatStore'
import type { ChatTurn, Widget } from '@/types'

// Stub WidgetGrid so the union-type assertions don't depend on Recharts; render a marker per
// widget so we can confirm AssistantTurn forwards each member of the union.
vi.mock('@/components/chat/WidgetGrid', () => ({
    WidgetGrid: ({ widgets }: { widgets: Widget[] }) => (
        <div data-testid="widget-grid">
            {widgets.map((w, i) => (
                <span key={i} data-testid={`w-${w.type}`}>
                    {w.title}
                </span>
            ))}
        </div>
    ),
    WidgetGridSkeleton: () => <div data-testid="widget-skeleton" />,
}))

const mocks = vi.hoisted(() => ({ retry: vi.fn() }))
vi.mock('@/hooks/useQueryStream', () => ({
    useQueryStream: () => ({ retry: mocks.retry, submit: vi.fn(), stop: vi.fn() }),
}))

const allWidgets: Widget[] = [
    { type: 'stat_card', span: 3, title: 'Total', payload: { value: '$5M' } },
    { type: 'bar_chart', span: 6, title: 'By region', payload: { data: [], xKey: 'region', series: [] } },
    { type: 'line_chart', span: 6, title: 'Trend', payload: { data: [], xKey: 'month', series: [] } },
    { type: 'pie_chart', span: 4, title: 'Share', payload: { slices: [] } },
    { type: 'table', span: 12, title: 'Rows', payload: { data: [], columns: [] } },
]

const baseTurn: ChatTurn = {
    id: 't1',
    question: 'Compare revenue by region',
    summary: 'The West region leads.',
    widgets: [],
    reasoningSteps: [
        { title: 'Understanding…', tool: 'route' },
        { title: 'Running query', tool: 'db_exec' },
    ],
    status: 'complete',
}

const turn = (over: Partial<ChatTurn> = {}): ChatTurn => ({ ...baseTurn, ...over })

describe('AssistantTurn', () => {
    beforeEach(() => {
        mocks.retry.mockReset()
        useChatStore.setState({ activeId: 'conv-1', isStreaming: false })
    })

    it('renders the streamed insight summary', () => {
        render(<AssistantTurn turn={turn()} isLast />)
        expect(screen.getByText('The West region leads.')).toBeInTheDocument()
    })

    it('renders every widget union type passed in', () => {
        render(<AssistantTurn turn={turn({ widgets: allWidgets })} isLast />)
        for (const w of allWidgets) {
            expect(screen.getByTestId(`w-${w.type}`)).toBeInTheDocument()
        }
    })

    it('shows the error state with the turn error message', () => {
        render(<AssistantTurn turn={turn({ status: 'error', error: 'QueryExecutionError: bad SQL' })} isLast />)
        expect(screen.getByText('QueryExecutionError: bad SQL')).toBeInTheDocument()
    })

    it('falls back to a generic error message when none is provided', () => {
        render(<AssistantTurn turn={turn({ status: 'error', error: undefined })} isLast />)
        expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })

    it('handles the empty / no-data turn (summary only, no widgets, no crash)', () => {
        render(<AssistantTurn turn={turn({ widgets: [], summary: 'I found no matching data.' })} isLast />)
        expect(screen.getByText('I found no matching data.')).toBeInTheDocument()
        // An empty widget grid still mounts but renders no widget markers.
        expect(screen.queryByTestId('w-bar_chart')).not.toBeInTheDocument()
    })

    it('shows the chart skeleton only while streaming after the a2ui step fires', () => {
        const streamingTurn = turn({
            status: 'streaming',
            widgets: [],
            reasoningSteps: [{ title: 'Designing the charts…', tool: 'a2ui_schema' }],
        })
        render(<AssistantTurn turn={streamingTurn} isLast />)
        expect(screen.getByTestId('widget-skeleton')).toBeInTheDocument()
    })

    it('shows a Retry affordance for the last completed (non-conversational) turn', async () => {
        const user = userEvent.setup()
        render(<AssistantTurn turn={turn()} isLast />)
        const retryBtn = screen.getByRole('button', { name: /retry/i })
        await user.click(retryBtn)
        expect(mocks.retry).toHaveBeenCalledWith('conv-1')
    })

    it('hides Retry + reasoning trace for a pure conversational reply', () => {
        const convo = turn({
            widgets: [],
            reasoningSteps: [{ title: 'Understanding…', tool: 'route' }],
            summary: 'Hi! Ask me about your sales data.',
        })
        render(<AssistantTurn turn={convo} isLast />)
        expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
        // No reasoning disclosure button for a routed-only reply.
        expect(screen.queryByRole('button', { name: /reasoning steps/i })).not.toBeInTheDocument()
    })

    it('collapses/expands the reasoning disclosure', async () => {
        const user = userEvent.setup()
        render(<AssistantTurn turn={turn()} isLast />)
        // Completed turn → disclosure starts collapsed.
        const toggle = screen.getByRole('button', { name: /show reasoning steps/i })
        expect(toggle).toHaveAttribute('aria-expanded', 'false')
        await user.click(toggle)
        expect(screen.getByRole('button', { name: /hide reasoning steps/i })).toHaveAttribute(
            'aria-expanded',
            'true',
        )
    })
})

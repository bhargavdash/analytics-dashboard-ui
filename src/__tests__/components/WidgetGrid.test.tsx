import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WidgetGrid } from '@/components/chat/WidgetGrid'
import type { Widget } from '@/types'

// Mock the Recharts-backed leaf components so the test never touches Recharts (which can't
// measure size in jsdom). Each renders an identifiable marker so we can assert the dispatcher
// picked the right one for each member of the Widget discriminated union.
vi.mock('@/components/dashboard/widgets/BarChart', () => ({
    BarChart: () => <div data-testid="bar-chart" />,
}))
vi.mock('@/components/dashboard/widgets/LineChart', () => ({
    LineChart: () => <div data-testid="line-chart" />,
}))
vi.mock('@/components/dashboard/widgets/PieChart', () => ({
    PieChart: () => <div data-testid="pie-chart" />,
}))
vi.mock('@/components/dashboard/widgets/TableWidget', () => ({
    TableWidget: () => <div data-testid="table-widget" />,
}))
vi.mock('@/components/dashboard/widgets/StatCard', () => ({
    StatCard: ({ title }: { title: string }) => <div data-testid="stat-card">{title}</div>,
}))

const widgets: Record<string, Widget> = {
    stat_card: { type: 'stat_card', span: 3, title: 'Total revenue', payload: { value: '$5M' } },
    bar_chart: { type: 'bar_chart', span: 6, title: 'By region', payload: { data: [], xKey: 'region', series: [] } },
    line_chart: { type: 'line_chart', span: 6, title: 'Trend', payload: { data: [], xKey: 'month', series: [] } },
    pie_chart: { type: 'pie_chart', span: 4, title: 'Share', payload: { slices: [] } },
    table: { type: 'table', span: 12, title: 'Rows', payload: { data: [], columns: [] } },
}

describe('WidgetGrid', () => {
    it('renders nothing when there are no widgets', () => {
        const { container } = render(<WidgetGrid widgets={[]} />)
        expect(container).toBeEmptyDOMElement()
    })

    it.each([
        ['stat_card', 'stat-card'],
        ['bar_chart', 'bar-chart'],
        ['line_chart', 'line-chart'],
        ['pie_chart', 'pie-chart'],
        ['table', 'table-widget'],
    ])('renders the %s widget via the correct chart component', async (key, testId) => {
        render(<WidgetGrid widgets={[widgets[key]]} />)
        // Widget is lazy-loaded (code-split), so it resolves asynchronously.
        expect(await screen.findByTestId(testId)).toBeInTheDocument()
    })

    it('applies the span class from the widget spec', async () => {
        const { container } = render(<WidgetGrid widgets={[widgets.bar_chart]} />)
        await screen.findByTestId('bar-chart')
        expect(container.querySelector('.col-span-6')).toBeInTheDocument()
    })

    it('renders multiple widgets together', async () => {
        render(<WidgetGrid widgets={[widgets.stat_card, widgets.bar_chart, widgets.table]} />)
        expect(await screen.findByTestId('stat-card')).toBeInTheDocument()
        expect(await screen.findByTestId('bar-chart')).toBeInTheDocument()
        expect(await screen.findByTestId('table-widget')).toBeInTheDocument()
    })

    it('gives charts an accessible image role + label derived from the title', async () => {
        render(<WidgetGrid widgets={[widgets.bar_chart]} />)
        await screen.findByTestId('bar-chart')
        expect(screen.getByRole('img', { name: 'Bar chart: By region' })).toBeInTheDocument()
    })
})

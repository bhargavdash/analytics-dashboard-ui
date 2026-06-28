import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from '@/store/useChatStore'
import type { Widget } from '@/types'

// Reset the store to a clean slate before each case (it's a module singleton).
const reset = () =>
    useChatStore.setState({
        conversations: [],
        activeId: null,
        title: null,
        turns: [],
        activeDataset: null,
        searchQuery: '',
        isStreaming: false,
        error: null,
    })

const s = () => useChatStore.getState()

const barWidget: Widget = {
    type: 'bar_chart',
    span: 12,
    title: 'Revenue by region',
    payload: { data: [{ region: 'West', revenue: 5 }], xKey: 'region', series: [{ key: 'revenue', color: '#000' }] },
}

describe('useChatStore — streaming turn reducer', () => {
    beforeEach(reset)

    it('replays a full data turn: meta → reasoning → tokens → dashboard → done', () => {
        // appendUserTurn: an optimistic pending assistant turn appears.
        s().appendUserTurn('Compare revenue by region')
        expect(s().turns).toHaveLength(1)
        expect(s().turns[0]).toMatchObject({
            question: 'Compare revenue by region',
            summary: null,
            widgets: [],
            reasoningSteps: [],
            status: 'streaming',
        })

        // meta → setActiveConversation assigns the id and (first time) the title.
        s().setActiveConversation('conv-1', 'Compare revenue by region')
        expect(s().activeId).toBe('conv-1')
        expect(s().title).toBe('Compare revenue by region')

        // reasoning ×2 → patchLastTurn with growing steps.
        s().patchLastTurn({ reasoningSteps: [{ title: 'Understanding…', tool: 'route' }] })
        s().patchLastTurn({
            reasoningSteps: [
                { title: 'Understanding…', tool: 'route' },
                { title: 'SQL ready', tool: 'sql_gen' },
            ],
        })
        expect(s().turns[0].reasoningSteps).toHaveLength(2)

        // summary_token ×N → appendSummaryToken accretes the prose.
        for (const tok of ['The ', 'West ', 'leads.']) s().appendSummaryToken(tok)
        expect(s().turns[0].summary).toBe('The West leads.')

        // dashboard → patch widgets only (summary preserved).
        s().patchLastTurn({ widgets: [barWidget] })
        expect(s().turns[0].widgets).toEqual([barWidget])
        expect(s().turns[0].summary).toBe('The West leads.')

        // done → mark complete.
        s().setLastTurnStatus('complete')
        expect(s().turns[0].status).toBe('complete')
    })

    it('appendSummaryToken starts from empty when summary is null', () => {
        s().appendUserTurn('q')
        expect(s().turns[0].summary).toBeNull()
        s().appendSummaryToken('Hello')
        expect(s().turns[0].summary).toBe('Hello')
    })

    it('produces a new turns array reference on each patch (so React re-renders)', () => {
        s().appendUserTurn('q')
        const before = s().turns
        s().appendSummaryToken('x')
        expect(s().turns).not.toBe(before)
        // ...and a new object for the patched turn, old one untouched.
        expect(s().turns[0]).not.toBe(before[0])
    })

    it('handles a conversational reply: message patches summary, then completes', () => {
        s().appendUserTurn('hello')
        s().patchLastTurn({ summary: 'Hi! Ask me about your sales data.' })
        s().setLastTurnStatus('complete')
        expect(s().turns[0]).toMatchObject({
            summary: 'Hi! Ask me about your sales data.',
            widgets: [],
            status: 'complete',
        })
    })

    it('error event sets status=error with the message; setError holds it globally', () => {
        s().appendUserTurn('boom')
        s().setError('ValueError: nope')
        s().setLastTurnStatus('error', 'ValueError: nope')
        expect(s().error).toBe('ValueError: nope')
        expect(s().turns[0]).toMatchObject({ status: 'error', error: 'ValueError: nope' })
    })

    it('removeLastTurn drops the in-flight turn (used by retry)', () => {
        s().appendUserTurn('first')
        s().appendUserTurn('second')
        expect(s().turns).toHaveLength(2)
        s().removeLastTurn()
        expect(s().turns).toHaveLength(1)
        expect(s().turns[0].question).toBe('first')
    })

    it('appends multiple turns in order (a thread)', () => {
        s().appendUserTurn('q1')
        s().appendSummaryToken('a1')
        s().setLastTurnStatus('complete')
        s().appendUserTurn('q2')
        expect(s().turns.map((t) => t.question)).toEqual(['q1', 'q2'])
        expect(s().turns[0].status).toBe('complete')
        expect(s().turns[1].status).toBe('streaming')
    })

    it('patch helpers are no-ops when there are no turns', () => {
        expect(() => {
            s().patchLastTurn({ summary: 'x' })
            s().appendSummaryToken('y')
            s().setLastTurnStatus('complete')
        }).not.toThrow()
        expect(s().turns).toHaveLength(0)
    })
})

describe('useChatStore — thread lifecycle & sidebar', () => {
    beforeEach(reset)

    it('startNewChat clears the active thread and dataset scope', () => {
        s().appendUserTurn('q')
        useChatStore.setState({ activeId: 'x', title: 't' })
        s().startNewChat()
        expect(s()).toMatchObject({ activeId: null, title: null, turns: [], activeDataset: null })
    })

    it('setActiveConversation does not overwrite an existing title', () => {
        useChatStore.setState({ title: 'Original' })
        s().setActiveConversation('c9', 'Server Title')
        expect(s().title).toBe('Original')
        expect(s().activeId).toBe('c9')
    })

    it('renameConversationLocal updates the list and the active title when ids match', () => {
        useChatStore.setState({
            conversations: [
                { id: 'a', title: 'Old A', dataset: 'sales', created_at: '', updated_at: '', turn_count: 1, widget_count: 0 },
            ],
            activeId: 'a',
            title: 'Old A',
        })
        s().renameConversationLocal('a', 'New A')
        expect(s().conversations[0].title).toBe('New A')
        expect(s().title).toBe('New A')
    })
})

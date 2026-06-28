import { describe, it, expect } from 'vitest'
import { parseSSEFrame, createSSEParser } from '@/lib/sse'

describe('parseSSEFrame', () => {
    it('parses a basic event + data frame', () => {
        expect(parseSSEFrame('event: meta\ndata: {"conversation_id":"abc"}')).toEqual({
            event: 'meta',
            data: '{"conversation_id":"abc"}',
        })
    })

    it('strips exactly one leading space after the colon', () => {
        // "data:  x" -> value is " x" (one space stripped, one kept)
        expect(parseSSEFrame('event: reasoning\ndata:  padded')).toEqual({
            event: 'reasoning',
            data: ' padded',
        })
    })

    it('joins multi-line data with newlines', () => {
        const raw = 'event: message\ndata: line one\ndata: line two\ndata: line three'
        expect(parseSSEFrame(raw)).toEqual({
            event: 'message',
            data: 'line one\nline two\nline three',
        })
    })

    it('ignores comment lines and unknown fields', () => {
        const raw = ': keep-alive comment\nevent: done\nid: 42\ndata: {"message":"Complete"}'
        expect(parseSSEFrame(raw)).toEqual({ event: 'done', data: '{"message":"Complete"}' })
    })

    it('returns null for an empty / whitespace-only frame', () => {
        expect(parseSSEFrame('')).toBeNull()
        expect(parseSSEFrame('   \n  ')).toBeNull()
    })

    it('returns null when the event field is missing', () => {
        expect(parseSSEFrame('data: {"orphan":true}')).toBeNull()
    })

    it('returns null when the data field is missing', () => {
        expect(parseSSEFrame('event: meta')).toBeNull()
    })

    it('tolerates a malformed line with no colon', () => {
        expect(parseSSEFrame('event: meta\ngarbage-with-no-colon\ndata: ok')).toEqual({
            event: 'meta',
            data: 'ok',
        })
    })
})

describe('createSSEParser (stateful, chunk-fed)', () => {
    it('splits multiple complete frames in one push', () => {
        const parser = createSSEParser()
        const frames = parser.push(
            'event: meta\ndata: {"a":1}\n\nevent: reasoning\ndata: {"step":"route"}\n\n',
        )
        expect(frames).toHaveLength(2)
        expect(frames[0]).toEqual({ event: 'meta', data: '{"a":1}' })
        expect(frames[1]).toEqual({ event: 'reasoning', data: '{"step":"route"}' })
    })

    it('buffers a frame split across two pushes (the core streaming case)', () => {
        const parser = createSSEParser()
        // First chunk ends mid-frame — nothing complete yet.
        expect(parser.push('event: summary_token\ndata: {"tok')).toEqual([])
        // Second chunk completes it.
        const frames = parser.push('en":"Hi"}\n\n')
        expect(frames).toEqual([{ event: 'summary_token', data: '{"token":"Hi"}' }])
    })

    it('treats the blank line as the only frame delimiter', () => {
        const parser = createSSEParser()
        // A frame is held back until its terminating blank line arrives.
        expect(parser.push('event: done\ndata: {"message":"Complete"}')).toEqual([])
        expect(parser.push('\n\n')).toEqual([{ event: 'done', data: '{"message":"Complete"}' }])
    })

    it('skips empty frames produced by consecutive blank lines', () => {
        const parser = createSSEParser()
        const frames = parser.push('event: meta\ndata: {"a":1}\n\n\n\nevent: done\ndata: {"d":1}\n\n')
        expect(frames).toEqual([
            { event: 'meta', data: '{"a":1}' },
            { event: 'done', data: '{"d":1}' },
        ])
    })

    it('flush() drains a final frame not terminated by a blank line', () => {
        const parser = createSSEParser()
        expect(parser.push('event: done\ndata: {"message":"Complete"}')).toEqual([])
        expect(parser.flush()).toEqual([{ event: 'done', data: '{"message":"Complete"}' }])
        // Buffer is cleared after flushing.
        expect(parser.flush()).toEqual([])
    })

    it('reconstructs a realistic token stream end to end', () => {
        const parser = createSSEParser()
        const out: { event: string; data: string }[] = []
        // Simulate awkward byte boundaries from the network.
        const wire = [
            'event: meta\ndata: {"conversation_id":"c1"}\n\nevent: reason',
            'ing\ndata: {"step":"route","message":"Understanding…"}\n\n',
            'event: summary_token\ndata: {"token":"The "}\n\nevent: summary_token\ndata: {"token":"West"}\n\n',
            'event: dashboard\ndata: {"widgets":[]}\n\nevent: done\ndata: {"message":"Complete"}\n\n',
        ]
        for (const chunk of wire) out.push(...parser.push(chunk))
        out.push(...parser.flush())

        expect(out.map((f) => f.event)).toEqual([
            'meta',
            'reasoning',
            'summary_token',
            'summary_token',
            'dashboard',
            'done',
        ])
        const tokens = out.filter((f) => f.event === 'summary_token').map((f) => JSON.parse(f.data).token)
        expect(tokens.join('')).toBe('The West')
    })
})

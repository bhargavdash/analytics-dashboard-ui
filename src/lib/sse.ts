// Server-Sent Events frame parser.
//
// Why this exists as its own module: an SSE stream over fetch+ReadableStream arrives as
// arbitrary byte chunks — a single `read()` may split one event across two chunks, or pack
// several events into one. The parser is the one place that turns that byte soup into clean
// `{ event, data }` frames, buffering the partial tail between pushes. Extracting it from the
// streaming hook makes it unit-testable in isolation (no fetch, no React) and reusable.
//
// Frame grammar (a subset of the WHATWG SSE spec, which is all the backend emits):
//   event: <type>\n
//   data: <payload line 1>\n
//   data: <payload line 2>\n
//   \n                         <-- blank line terminates the frame
// Multiple `data:` lines are joined with "\n" (so a payload can contain newlines).
// A leading single space after the colon is stripped, per spec.

export interface SSEFrame {
    event: string
    data: string
}

// Parse one already-delimited frame (the text between two blank-line boundaries).
// Returns null for empty/comment-only/malformed frames so callers can skip them.
export function parseSSEFrame(raw: string): SSEFrame | null {
    if (!raw.trim()) return null

    let event = ''
    const dataLines: string[] = []

    for (const line of raw.split('\n')) {
        if (line.startsWith(':')) continue // comment line — ignore
        const colon = line.indexOf(':')
        if (colon === -1) continue // field with no value / malformed — ignore
        const field = line.slice(0, colon)
        // Strip exactly one leading space after the colon (SSE spec).
        let value = line.slice(colon + 1)
        if (value.startsWith(' ')) value = value.slice(1)

        if (field === 'event') event = value
        else if (field === 'data') dataLines.push(value)
        // other fields (id, retry) are not used by Helix — ignored
    }

    if (!event || dataLines.length === 0) return null
    return { event, data: dataLines.join('\n') }
}

// A stateful, chunk-fed parser. Push decoded text as it streams in; get back the frames
// that completed in this push. The unterminated tail is buffered until the next push.
export function createSSEParser() {
    let buffer = ''

    return {
        // Feed a decoded text chunk; returns any frames that became complete.
        push(chunk: string): SSEFrame[] {
            buffer += chunk
            const parts = buffer.split('\n\n')
            // The last part is either '' (chunk ended on a boundary) or a partial frame.
            buffer = parts.pop() ?? ''

            const frames: SSEFrame[] = []
            for (const part of parts) {
                const frame = parseSSEFrame(part)
                if (frame) frames.push(frame)
            }
            return frames
        },

        // Flush anything left in the buffer at stream end (a frame not followed by \n\n).
        flush(): SSEFrame[] {
            const tail = buffer
            buffer = ''
            const frame = parseSSEFrame(tail)
            return frame ? [frame] : []
        },
    }
}

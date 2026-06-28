import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/store/useChatStore'

// Screen-reader announcer for streaming assistant output.
//
// The problem: the insight streams in token-by-token by mutating one text node. If we let a
// live region read every mutation, a screen reader stutters out the answer one fragment at a
// time — unusable. (For that same reason the conversation `role="log"` uses
// aria-relevant="additions", which suppresses text-node mutations.)
//
// The fix: announce ONCE, when the turn finishes. We watch `isStreaming` fall from true→false
// and then push the completed turn's insight (or its error) into a polite `role="status"`
// region. The screen-reader user hears the user message (announced by the log as a new node)
// while it streams, then the full insight read cleanly when it's done.
export const LiveAnnouncer = () => {
    const isStreaming = useChatStore((s) => s.isStreaming)
    const turns = useChatStore((s) => s.turns)
    const [message, setMessage] = useState('')
    const wasStreaming = useRef(false)

    useEffect(() => {
        if (wasStreaming.current && !isStreaming) {
            const last = turns.at(-1)
            if (last) {
                if (last.status === 'error') {
                    setMessage(`Error: ${last.error ?? 'something went wrong'}`)
                } else if (last.summary) {
                    setMessage(last.summary)
                }
            }
        }
        wasStreaming.current = isStreaming
    }, [isStreaming, turns])

    return (
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {message}
        </div>
    )
}

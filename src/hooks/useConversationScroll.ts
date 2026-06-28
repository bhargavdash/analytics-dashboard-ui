import { useCallback, useEffect, useRef } from 'react'
import { useStickToBottom } from './useStickToBottom'

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Claude-style conversation scrolling, built on TWO distinct intents that used to be
// (incorrectly) bound to one element:
//
//   1. TOP-ANCHOR — when a new turn is added, smooth-scroll so that turn's question
//      sits near the top of the viewport and the answer streams into the space below.
//      Bound to `lastTurnRef` (the newest turn), scrolled with block:'start'.
//
//   2. BOTTOM-FOLLOW / PILL — "is the bottom of the conversation in view?" Owned by
//      `useStickToBottom`, bound to a zero-height `bottomRef` sentinel. Height-independent
//      (the old code observed the whole, often multi-viewport-tall, last turn, so the pill
//      never fired while any sliver of a tall answer was on screen).
export function useConversationScroll(turnCount: number, isStreaming: boolean) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const lastTurnRef = useRef<HTMLDivElement>(null) // top-anchor target
    const bottomRef = useRef<HTMLDivElement>(null) // bottom sentinel
    const prevCount = useRef(0)

    const { showPill, markNotAtBottom } = useStickToBottom(scrollRef, bottomRef, isStreaming)

    const behavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth')

    const scrollToLatest = useCallback(() => {
        bottomRef.current?.scrollIntoView({ block: 'end', behavior: behavior() })
    }, [])

    // New turn → anchor its question near the top. We optimistically mark "not at bottom"
    // so the stick-to-bottom follow can't fight this scroll while it animates; the sentinel
    // observer re-confirms the real state a frame later.
    useEffect(() => {
        if (turnCount > prevCount.current) {
            markNotAtBottom()
            lastTurnRef.current?.scrollIntoView({ block: 'start', behavior: behavior() })
        }
        prevCount.current = turnCount
    }, [turnCount, markNotAtBottom])

    return { scrollRef, lastTurnRef, bottomRef, showPill, scrollToLatest }
}

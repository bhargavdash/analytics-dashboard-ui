import { useCallback, useEffect, useRef, useState } from 'react'

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
//   2. BOTTOM-FOLLOW / PILL — "is the bottom of the conversation in view?" Bound to a
//      zero-height `bottomRef` sentinel at the end of the content, observed with an
//      IntersectionObserver. This is height-independent: the old code observed the whole
//      (often multi-viewport-tall) last turn, so the pill never fired while any sliver of
//      a tall answer was on screen. A sentinel fixes that.
//
// Stick-to-bottom: while streaming, if the user is pinned to the bottom we keep following
// the growing answer; the moment they scroll up, the sentinel goes out of view and the
// follow stops (the pill takes over).
export function useConversationScroll(turnCount: number, isStreaming: boolean) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const lastTurnRef = useRef<HTMLDivElement>(null)   // top-anchor target
    const bottomRef = useRef<HTMLDivElement>(null)     // bottom sentinel
    const [showPill, setShowPill] = useState(false)
    const atBottomRef = useRef(true)                   // live: is the sentinel visible?
    const prevCount = useRef(0)

    const behavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth')

    const scrollToLatest = useCallback(() => {
        bottomRef.current?.scrollIntoView({ block: 'end', behavior: behavior() })
    }, [])

    // 1. New turn → anchor its question near the top. We optimistically mark "not at
    //    bottom" so the stick-to-bottom follow below can't fight this scroll while it
    //    animates; the observer re-confirms the real state a frame later.
    useEffect(() => {
        if (turnCount > prevCount.current) {
            atBottomRef.current = false
            lastTurnRef.current?.scrollIntoView({ block: 'start', behavior: behavior() })
        }
        prevCount.current = turnCount
    }, [turnCount])

    // 2. Sentinel drives both the at-bottom flag and pill visibility. The sentinel is a
    //    stable node, so this observer is set up once.
    useEffect(() => {
        const el = bottomRef.current
        const root = scrollRef.current
        if (!el || !root) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                atBottomRef.current = entry.isIntersecting
                setShowPill(!entry.isIntersecting)
            },
            { root, threshold: 0 },
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    // 3. Stick-to-bottom while streaming: as the answer grows (reasoning steps, summary
    //    tokens, charts mounting), keep the bottom pinned ONLY if the user is already
    //    there. rAF-coalesced so a burst of token mutations triggers at most one scroll
    //    per frame. Uses behavior:'auto' — following should be instant, not animated.
    useEffect(() => {
        if (!isStreaming) return
        const root = scrollRef.current
        if (!root) return
        let raf = 0
        const follow = () => {
            if (!atBottomRef.current || raf) return
            raf = requestAnimationFrame(() => {
                raf = 0
                bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' })
            })
        }
        const observer = new MutationObserver(follow)
        observer.observe(root, { childList: true, subtree: true, characterData: true })
        return () => {
            observer.disconnect()
            if (raf) cancelAnimationFrame(raf)
        }
    }, [isStreaming])

    return { scrollRef, lastTurnRef, bottomRef, showPill, scrollToLatest }
}

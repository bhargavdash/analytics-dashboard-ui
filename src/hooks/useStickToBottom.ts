import { useCallback, useEffect, useRef, useState } from 'react'

// "Is the bottom of the scroll area in view, and follow it while content grows."
//
// This is the height-independent core of Claude-style chat scrolling, split out so it can be
// unit-tested without the rest of the conversation-scroll machinery. It watches a zero-height
// SENTINEL node at the very end of the content (not the last turn, which can be many viewports
// tall) via an IntersectionObserver: the sentinel being visible == the user is pinned to the
// bottom. While `isStreaming`, a rAF-coalesced MutationObserver keeps the sentinel scrolled
// into view *only* while the user is still at the bottom — the instant they scroll up, the
// sentinel leaves the viewport, `atBottom` flips false, and the follow releases.
//
// Returns:
//   atBottom        — live state: is the sentinel currently visible?
//   showPill        — convenience inverse, for a "jump to latest" affordance
//   markNotAtBottom — let the owner optimistically release the follow (e.g. when it kicks off
//                     its own scroll animation that would otherwise fight this one)
export function useStickToBottom(
    scrollRef: React.RefObject<HTMLElement | null>,
    sentinelRef: React.RefObject<HTMLElement | null>,
    isStreaming: boolean,
) {
    const [atBottom, setAtBottom] = useState(true)
    // A ref mirror so the streaming-follow effect can read the latest value without
    // re-subscribing the MutationObserver on every intersection change.
    const atBottomRef = useRef(true)

    const markNotAtBottom = useCallback(() => {
        atBottomRef.current = false
        setAtBottom(false)
    }, [])

    // 1. Sentinel visibility drives `atBottom`. The sentinel is a stable node, so this
    //    observer is wired up once.
    useEffect(() => {
        const el = sentinelRef.current
        const root = scrollRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                atBottomRef.current = entry.isIntersecting
                setAtBottom(entry.isIntersecting)
            },
            { root: root ?? null, threshold: 0 },
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [scrollRef, sentinelRef])

    // 2. Stick-to-bottom while streaming: as the answer grows (reasoning steps, summary
    //    tokens, charts mounting) keep the sentinel pinned, but ONLY if the user is already
    //    there. rAF-coalesced so a burst of token mutations triggers at most one scroll per
    //    frame. behavior:'auto' — following should be instant, not animated.
    useEffect(() => {
        if (!isStreaming) return
        const root = scrollRef.current
        if (!root) return
        let raf = 0
        const follow = () => {
            if (!atBottomRef.current || raf) return
            raf = requestAnimationFrame(() => {
                raf = 0
                sentinelRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' })
            })
        }
        const observer = new MutationObserver(follow)
        observer.observe(root, { childList: true, subtree: true, characterData: true })
        return () => {
            observer.disconnect()
            if (raf) cancelAnimationFrame(raf)
        }
    }, [isStreaming, scrollRef, sentinelRef])

    return { atBottom, showPill: !atBottom, markNotAtBottom }
}
